import * as React from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Label } from "./label.js";
import { Description } from "../description/description.js";
import { TextField } from "../textfield/textfield.js";
import { Input } from "../input/input.js";
import { SearchField } from "../search-field/search-field.js";

// The existing form suite only mounts supporting parts inside a field. Source
// collection text and explicit native labels must also render without Base context.
test("standalone supporting parts preserve native labels and render composition", async () => {
  const label = React.createRef<HTMLElement>();
  const screen = await render(
    <div>
      <Label ref={label} htmlFor="standalone-email">
        Email address
      </Label>
      <input id="standalone-email" aria-describedby="standalone-description" />
      <Description id="standalone-description">Use your work address</Description>
      <Label nativeLabel={false} render={<span />}>
        Collection heading
      </Label>
      <Description render={<p />}>Collection explanation</Description>
    </div>,
  );
  const input = screen.getByRole("textbox", { name: "Email address" });
  await expect.element(input).toHaveAccessibleDescription("Use your work address");
  await screen.getByText("Email address").click();
  expect(document.activeElement).toBe(input.element());
  expect(label.current?.tagName).toBe("LABEL");
  expect(screen.getByText("Collection heading").element().tagName).toBe("SPAN");
  expect(screen.getByText("Collection explanation").element().tagName).toBe("P");
});

test("owned field scopes retain native associations without leaking to siblings", async () => {
  const screen = await render(
    <div>
      <TextField>
        <Label required>Account</Label>
        <Input required />
        <Description>Account identifier</Description>
      </TextField>
      <SearchField>
        <Label>Find account</Label>
        <SearchField.Group>
          <SearchField.Input />
        </SearchField.Group>
        <Description>Search account identifiers</Description>
      </SearchField>
      <Description>Unassociated collection text</Description>
    </div>,
  );
  const account = screen.getByLabelText("Account", { exact: true });
  const search = screen.getByRole("searchbox", { name: "Find account" });
  await expect.element(account).toHaveAccessibleDescription("Account identifier");
  await expect.element(search).toHaveAccessibleDescription("Search account identifiers");
  await screen.getByText("Account", { exact: true }).click();
  expect(document.activeElement).toBe(account.element());
  await screen.getByText("Find account", { exact: true }).click();
  expect(document.activeElement).toBe(search.element());
  expect(screen.getByText("Unassociated collection text").element().tagName).toBe("SPAN");
});
