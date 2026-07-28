"""
E2E — Voltar do checkout Shopify (Playwright, Python).

Valida o fluxo completo:
  produto -> escolher tamanho -> "Comprar agora" -> escolher método Shopify
  -> redirect externo -> botão "Voltar" do navegador
  -> o modal de resumo reaparece e não há loading infinito.

Como correr (com o dev server em http://localhost:8080):
    python3 e2e/checkout_back_navigation.py
"""

import asyncio
import os
import sys
from pathlib import Path

from playwright.async_api import async_playwright

BASE_URL = os.environ.get("E2E_BASE_URL", "http://localhost:8080")
PRODUCT_PATH = os.environ.get("E2E_PRODUCT_PATH", "/produto/m-mr010jd-j1")
SHOTS = Path(__file__).parent / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)

LOADING_SELECTOR = ".animate-spin"


async def run() -> list[str]:
    failures: list[str] = []
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        # O checkout externo é substituído por uma página falsa para o teste
        # não depender da Shopify.
        async def route_handler(route):
            url = route.request.url
            if "localhost" in url or "127.0.0.1" in url:
                await route.continue_()
            elif route.request.resource_type == "document":
                await route.fulfill(
                    status=200,
                    content_type="text/html",
                    body="<h1>FAKE SHOPIFY CHECKOUT</h1>",
                )
            else:
                await route.continue_()

        await page.route("**/*", route_handler)

        await page.goto(BASE_URL + PRODUCT_PATH, wait_until="networkidle")

        # 1. Escolher o primeiro tamanho disponível
        size_button = page.locator("button:not([disabled])").filter(
            has_text=__import__("re").compile(r"^(3[6-9]|4[0-6])$")
        ).first
        await size_button.wait_for(state="visible", timeout=15000)
        size_label = (await size_button.inner_text()).strip()
        await size_button.click()

        # 2. Abrir o modal de checkout
        buy = page.get_by_role("button", name=__import__("re").compile(r"Comprar agora|Buy now|Comprar ahora"))
        await buy.first.click()
        await page.wait_for_timeout(1200)
        await page.screenshot(path=str(SHOTS / "1_modal_open.png"))
        body = await page.inner_text("body")
        if "PIX" not in body.upper():
            failures.append("modal de pagamento não abriu")

        # 3. Escolher um método hospedado na Shopify (redirect imediato)
        method = page.get_by_text(__import__("re").compile(r"^(Cartão|Card)$")).first
        await method.click()
        await page.wait_for_timeout(4000)
        await page.screenshot(path=str(SHOTS / "2_redirect.png"))
        if BASE_URL in page.url:
            failures.append(f"não houve redirect para o checkout externo (url={page.url})")
        print("redirecionado para:", page.url)

        # 4. Botão "Voltar" do navegador
        await page.go_back(wait_until="domcontentloaded")
        await page.wait_for_timeout(2500)
        await page.screenshot(path=str(SHOTS / "3_back.png"))
        print("url após voltar:", page.url)

        if BASE_URL not in page.url:
            failures.append("voltar não regressou à loja")

        # 4a. Sem loading infinito
        spinners = page.locator(LOADING_SELECTOR)
        if await spinners.count() > 0 and await spinners.first.is_visible():
            failures.append("loading continua visível após voltar (loading infinito)")

        # 4b. O modal de resumo reapareceu
        back_body = await page.inner_text("body")
        if "PIX" not in back_body.upper():
            failures.append("modal de resumo do pedido não reapareceu após voltar")

        # 4c. A página continua interativa
        try:
            await page.get_by_role("button", name=size_label, exact=True).first.wait_for(timeout=5000)
        except Exception:
            failures.append("página não está interativa após voltar")

        await browser.close()
    return failures


def main() -> int:
    failures = asyncio.run(run())
    if failures:
        print("\nE2E FALHOU:")
        for f in failures:
            print(" -", f)
        return 1
    print("\nE2E OK — modal restaurado e sem loading infinito.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
