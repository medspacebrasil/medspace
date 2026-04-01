import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByText("Entre com sua conta")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Senha")).toBeVisible()
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible()
    await expect(page.getByText("Cadastre sua clínica")).toBeVisible()
  })

  test("cadastro page renders correctly", async ({ page }) => {
    await page.goto("/cadastro")
    await expect(
      page.getByText("Cadastre sua clínica gratuitamente")
    ).toBeVisible()
    await expect(page.getByLabel("Seu nome")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Senha")).toBeVisible()
    await expect(page.getByLabel("Nome da Clínica")).toBeVisible()
    await expect(page.getByLabel("WhatsApp (DDD + número)")).toBeVisible()
    await expect(page.getByLabel("Cidade")).toBeVisible()
    await expect(page.getByLabel("Bairro")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Cadastrar Clínica" })
    ).toBeVisible()
  })

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Email").fill("wrong@email.com")
    await page.getByLabel("Senha").fill("wrongpassword")
    await page.getByRole("button", { name: "Entrar" }).click()
    await expect(
      page.getByText("Email ou senha incorretos")
    ).toBeVisible({ timeout: 10000 })
  })

  test("login link navigates to cadastro", async ({ page }) => {
    await page.goto("/login")
    await page.getByText("Cadastre sua clínica").click()
    await expect(page).toHaveURL("/cadastro")
  })

  test("cadastro link navigates to login", async ({ page }) => {
    await page.goto("/cadastro")
    await page.getByText("Entrar").click()
    await expect(page).toHaveURL("/login")
  })
})
