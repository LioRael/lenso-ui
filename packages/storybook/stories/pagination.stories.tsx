// Adapted from HeroUI e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination, Separator, type PaginationRootProps } from "@lenso/ui";
import { Fragment, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { navigation as s } from "./navigation.stylex";
import { NavigationIcon } from "./navigation-icons";
const meta = {
  argTypes: { size: { control: "select", options: ["sm", "md", "lg"] } },
  component: Pagination,
  parameters: { layout: "centered" },
  title: "Components/Navigation/Pagination",
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;
const defaultArgs = { children: null };
type ExampleProps = PaginationRootProps & {
  ellipsis?: boolean;
  summary?: string;
  simple?: boolean;
  custom?: boolean;
  previousDisabled?: boolean;
};
function Example({ ellipsis, summary, simple, custom, previousDisabled, ...props }: ExampleProps) {
  const numbers = ellipsis ? [1, 2, 3, "ellipsis", 10, 11, 12] : [1, 2, 3];
  return (
    <Pagination {...props}>
      {summary && <Pagination.Summary>{summary}</Pagination.Summary>}
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous href="#page-previous" disabled={previousDisabled}>
            <Pagination.PreviousIcon>
              {custom && <NavigationIcon icon="gravity-ui:arrow-left" />}
            </Pagination.PreviousIcon>
            <span>{custom ? "Back" : simple ? "Prev" : "Previous"}</span>
          </Pagination.Previous>
        </Pagination.Item>
        {!simple &&
          numbers.map((number) => (
            <Pagination.Item key={number}>
              {number === "ellipsis" ? (
                <Pagination.Ellipsis />
              ) : (
                <Pagination.Link href={`#page-${number}`} isActive={number === 1}>
                  {number}
                </Pagination.Link>
              )}
            </Pagination.Item>
          ))}
        <Pagination.Item>
          <Pagination.Next href="#page-next">
            <span>{custom ? "Forward" : "Next"}</span>
            <Pagination.NextIcon>
              {custom && <NavigationIcon icon="gravity-ui:arrow-right" />}
            </Pagination.NextIcon>
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
function ControlledTemplate(props: PaginationRootProps) {
  const [page, setPage] = useState(1);
  const totalPages = 12,
    itemsPerPage = 10,
    totalItems = 120;
  const pages: (number | "start-ellipsis" | "end-ellipsis")[] = [1];
  if (page > 3) pages.push("start-ellipsis");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
  if (page < totalPages - 2) pages.push("end-ellipsis");
  pages.push(totalPages);
  return (
    <div {...stylex.props(s.paginationWidth)}>
      <Pagination {...props}>
        <Pagination.Summary>
          Showing {(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, totalItems)} of{" "}
          {totalItems} results
        </Pagination.Summary>
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous
              href={`#page-${page - 1}`}
              disabled={page === 1}
              onClick={(event) => {
                event.preventDefault();
                setPage((p) => p - 1);
              }}
            >
              <Pagination.PreviousIcon />
              <span>Previous</span>
            </Pagination.Previous>
          </Pagination.Item>
          {pages.map((p) => (
            <Pagination.Item key={p}>
              {typeof p === "string" ? (
                <Pagination.Ellipsis />
              ) : (
                <Pagination.Link
                  href={`#page-${p}`}
                  isActive={p === page}
                  onClick={(event) => {
                    event.preventDefault();
                    setPage(p);
                  }}
                >
                  {p}
                </Pagination.Link>
              )}
            </Pagination.Item>
          ))}
          <Pagination.Item>
            <Pagination.Next
              href={`#page-${page + 1}`}
              disabled={page === totalPages}
              onClick={(event) => {
                event.preventDefault();
                setPage((p) => p + 1);
              }}
            >
              <span>Next</span>
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
    </div>
  );
}
export const Default: Story = { args: defaultArgs, render: (props) => <Example {...props} /> };
export const Sizes: Story = {
  args: defaultArgs,
  render: (props) => (
    <div {...stylex.props(s.sizes)}>
      {(["sm", "md", "lg"] as const).map((size, index) => (
        <Fragment key={size}>
          <div {...stylex.props(s.linkSection)}>
            <span {...stylex.props(s.sizeLabel)}>{size}</span>
            <Example {...props} size={size} />
          </div>
          {index < 2 && <Separator />}
        </Fragment>
      ))}
    </div>
  ),
};
export const WithEllipsis: Story = {
  args: defaultArgs,
  render: (props) => <Example {...props} ellipsis />,
};
export const SimplePrevNext: Story = {
  args: defaultArgs,
  render: (props) => <Example {...props} simple summary="1 to 5 of 10 invoices" />,
};
export const WithSummary: Story = {
  args: defaultArgs,
  render: (props) => (
    <div {...stylex.props(s.paginationWidth)}>
      <Example {...props} ellipsis summary="Showing 1-10 of 120 results" />
    </div>
  ),
};
export const CustomIcons: Story = {
  args: defaultArgs,
  render: (props) => <Example {...props} custom />,
};
export const Controlled: Story = { args: defaultArgs, render: ControlledTemplate };
export const Disabled: Story = {
  args: defaultArgs,
  render: (props) => <Example {...props} previousDisabled />,
};
