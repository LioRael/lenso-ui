"use client";
import { AlertDialog, Button } from "@lenso/ui";
export function Default() {
  return (
    <AlertDialog>
      <AlertDialog.Trigger render={<Button destructive />}>删除项目</AlertDialog.Trigger>
      <AlertDialog.Backdrop />
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>删除项目？</AlertDialog.Title>
          <AlertDialog.Description>此项目及其文件将被永久删除。</AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Close>取消</AlertDialog.Close>
          <AlertDialog.Action variant="destructive">删除</AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}
