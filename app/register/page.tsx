'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { signup } from '../auth/actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button className="w-full" type="submit" disabled={pending}>
            {pending ? 'Registrando...' : 'Registrarse'}
        </Button>
    )
}

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null)

    async function clientAction(formData: FormData) {
        const res = await signup(formData)
        if (res?.error) {
            setError(res.error)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
                    <CardDescription>
                        Ingresa tus datos para registrarte.
                    </CardDescription>
                </CardHeader>
                <form action={clientAction}>
                    <CardContent className="grid gap-4">
                        {error && (
                            <div className="text-red-500 text-sm font-medium">
                                {error}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Nombre Completo</Label>
                            <Input id="fullName" name="fullName" type="text" placeholder="Juan Pérez" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@ejemplo.com" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <SubmitButton />
                        <div className="text-sm text-center text-gray-500">
                            ¿Ya tienes cuenta?{' '}
                            <Link href="/login" className="underline hover:text-gray-900 dark:hover:text-gray-100">
                                Inicia sesión
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
