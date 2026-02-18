import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface SignUpFormProps extends Omit<React.ComponentProps<"div">, "onSubmit"> {
  onSubmit: (data: {
    username: string
    password: string
    email: string
    surname: string
    firstname: string
  }) => void
  isLoading?: boolean
  error?: { message: string } | null
}

export function SignUpForm({
  className,
  onSubmit,
  isLoading,
  error,
  ...props
}: SignUpFormProps) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [firstname, setFirstname] = useState("")
  const [surname, setSurname] = useState("")
  const [password, setPassword] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({ username, email, firstname, surname, password })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Fill in the fields below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="cat"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="cat@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="first-name">First name</FieldLabel>
                  <Input
                    id="first-name"
                    type="text"
                    placeholder="Cat"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="surname">Surname</FieldLabel>
                  <Input
                    id="surname"
                    type="text"
                    placeholder="Surname"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
              {error && (
                <p className="text-sm text-destructive">{error.message}</p>
              )}
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Signing up..." : "Sign up"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link to="/signin" className="underline underline-offset-4 hover:text-primary">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
