"use client"

import * as React from "react"
import { useFormStatus } from "react-dom"
import { Button, type ButtonProps } from "@/components/ui/button"

interface PendingButtonProps extends ButtonProps {
  /** Texto exibido no lugar do children enquanto o form está enviando (ex.: "Excluindo...") */
  pendingText?: string
}

/**
 * Botão de submit que se desabilita automaticamente enquanto a server action
 * do form pai está em andamento (evita duplo clique/envio duplicado).
 *
 * IMPORTANTE: deve ser renderizado DENTRO de um <form action={...}> —
 * useFormStatus só reporta o pending do form ancestral.
 */
const PendingButton = React.forwardRef<HTMLButtonElement, PendingButtonProps>(
  ({ pendingText, children, disabled, ...props }, ref) => {
    const { pending } = useFormStatus()
    return (
      <Button ref={ref} type="submit" disabled={pending || disabled} {...props}>
        {pending && pendingText ? pendingText : children}
      </Button>
    )
  }
)
PendingButton.displayName = "PendingButton"

export { PendingButton }
