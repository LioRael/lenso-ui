# InputOTP materials

InputOTP now uses 44px circular digit fields and 22px tabular numerals.
A six-digit row with a separator is 328px wide and contracts within narrower
containers. Four-digit rows retain their intrinsic width. Narrow viewports retain
a 1:1 aspect ratio while shrinking and use tighter gaps to preserve digit space.
Ordinary material remains the default; `variant="secondary"` selects tertiary
fill. Set `glass` on InputOTP to use the same small action material as Input.
Glass takes precedence over variant and does not add elastic movement.

Existing Root, Group, Slot and Separator compositions remain supported. Native
Base UI value, paste, focus, validation, refs and form contracts are unchanged.
No consumer change is required unless exact previous geometry was assumed;
use `xstyle` for deliberate geometry overrides. Pointer editing keeps the native
caret; keyboard navigation shows the shared outline, independently of errors.
