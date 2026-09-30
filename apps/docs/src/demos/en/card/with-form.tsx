"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Button, Card, Form, Input, Label, Link, TextField } from "@lenso/ui";
import type { FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { s } from "./display.stylex";

export function WithForm() {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.alert("Form submitted successfully!");
  };
  return (
    <Card xstyle={s.maxMd}>
      <Card.Header>
        <Card.Title>Login</Card.Title>
        <Card.Description>Enter your credentials to access your account</Card.Description>
      </Card.Header>
      <Form onSubmit={onSubmit}>
        <Card.Content>
          <div {...stylex.props(s.column4)}>
            <TextField name="email">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="email@example.com"
                variant="secondary"
              />
            </TextField>
            <TextField name="password">
              <Label>Password</Label>
              <Input name="password" type="password" placeholder="••••••••" variant="secondary" />
            </TextField>
          </div>
        </Card.Content>
        <Card.Footer xstyle={s.formFooter}>
          <Button xstyle={s.full} type="submit">
            Sign In
          </Button>
          <Link xstyle={[s.centerText, s.textSm]} href="#">
            Forgot password?
          </Link>
        </Card.Footer>
      </Form>
    </Card>
  );
}
