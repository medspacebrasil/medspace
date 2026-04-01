import { test, expect } from "@playwright/test"

test.describe("Mobile Responsiveness", () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test("home page hero is readable on mobile", async ({ page }) => {
    await page.goto("/")
    await expect(
      page.getByText("Encontre o espaço ideal para sua")
    ).toBeVisible()
    await expect(page.getByText("Buscar Salas")).toBeVisible()
  })

  test("marketplace filters are usable on mobile", async ({ page }) => {
    await page.goto("/anuncios")
    await expect(page.getByText("Filtros")).toBeVisible()
    await expect(page.getByText("Encontrar Salas")).toBeVisible()
  })

  test("login form is usable on mobile", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Senha")).toBeVisible()
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible()
  })

  test("cadastro form is usable on mobile", async ({ page }) => {
    await page.goto("/cadastro")
    await expect(page.getByLabel("Seu nome")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Cadastrar Clínica" })
    ).toBeVisible()
  })
})
