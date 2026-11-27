<script setup lang="ts">
import {
  Accordion,
  AlertDialog,
  Avatar,
  AvatarGroup,
  Breadcrumbs,
  Fieldset,
  Input,
  Modal,
  Sheet,
  TextField,
} from "@lenso/ui-vue";
const names = ["Ada", "Bea", "Cy", "Dee"];
</script>
<template>
  <section aria-label="Adapter parity">
    <Breadcrumbs disabled separator="/">
      <Breadcrumbs.Item href="#before">Before</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#current" :disabled="false">Current</Breadcrumbs.Item>
    </Breadcrumbs>
    <Fieldset>
      <Fieldset.Group>
        <TextField>
          <TextField.Label>Account alias</TextField.Label>
          <TextField.Input clearLabel="Erase account alias" glass elastic />
        </TextField>
        <TextField layout="stacked">
          <TextField.Input aria-label="Manual layout" :clearable="false" />
        </TextField>
        <Accordion hideSeparator>
          <Accordion.Item value="details">
            <Accordion.Heading>
              <Accordion.Trigger>Account details</Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>Account panel</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="privacy" :hide-separator="false">
            <Accordion.Heading>
              <Accordion.Trigger>Privacy details</Accordion.Trigger>
            </Accordion.Heading>
          </Accordion.Item>
        </Accordion>
      </Fieldset.Group>
    </Fieldset>
    <TextField>
      <Input aria-label="Standalone alias" glass elastic />
    </TextField>
    <Accordion variant="surface">
      <Accordion.Item value="other">
        <Accordion.Heading>
          <Accordion.Trigger>Surface option</Accordion.Trigger>
        </Accordion.Heading>
      </Accordion.Item>
    </Accordion>
    <AvatarGroup :max="2" size="sm" overlap="clip" data-testid="clip-avatars">
      <Avatar v-for="name in names" :key="name">
        <Avatar.Fallback>{{ name }}</Avatar.Fallback>
      </Avatar>
    </AvatarGroup>
    <AvatarGroup :max="2" overlap="ring" data-testid="ring-avatars">
      <Avatar v-for="name in names" :key="name">
        <Avatar.Fallback>{{ name }}</Avatar.Fallback>
      </Avatar>
      <AvatarGroup.Count>Others</AvatarGroup.Count>
    </AvatarGroup>
    <Modal scroll="outside">
      <Modal.Trigger>Review layout</Modal.Trigger>
      <Modal.Content size="sm" placement="top">
        <Modal.Title>Layout review</Modal.Title>
        <Modal.Close />
      </Modal.Content>
    </Modal>
    <AlertDialog>
      <AlertDialog.Trigger>Review action</AlertDialog.Trigger>
      <AlertDialog.Content size="xs" placement="bottom">
        <AlertDialog.Icon variant="warning" />
        <AlertDialog.Title>Remove entry?</AlertDialog.Title>
        <AlertDialog.Footer layout="stacked">
          <AlertDialog.Action variant="destructive">Remove entry</AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
    <Sheet :edge-attached-snap-points="[1]">
      <Sheet.Trigger>Show detents</Sheet.Trigger>
      <Sheet.Backdrop />
      <Sheet.Content>
        <Sheet.Title>Detent review</Sheet.Title>
        <Sheet.Handle />
        <Sheet>
          <Sheet.Trigger>Open child sheet</Sheet.Trigger>
          <Sheet.Content>
            <Sheet.Title>Child sheet</Sheet.Title>
            <Sheet.Close>Close child</Sheet.Close>
          </Sheet.Content>
        </Sheet>
        <Sheet.Close>Finish detents</Sheet.Close>
      </Sheet.Content>
    </Sheet>
  </section>
</template>
