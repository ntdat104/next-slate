import React, { Ref, PropsWithChildren } from "react";
import ReactDOM from "react-dom";
// eslint-disable-next-line
import cx from "classnames";

interface BaseProps {
  className: string;
  [key: string]: unknown;
}
type OrNull<T> = T | null;

export const Button = React.forwardRef(
  (
    {
      className,
      active,
      reversed,
      ...props
    }: PropsWithChildren<
      {
        active: boolean;
        reversed: boolean;
      } & BaseProps
    >,
    ref: Ref<OrNull<HTMLSpanElement>>
  ) => (
    <span
      {...props}
      ref={ref as any}
      style={{
        cursor: "pointer",
        margin: "0px 10px",
        color: reversed
          ? active
            ? "white"
            : "#aaa"
          : active
          ? "black"
          : "#ccc",
      }}
      className={cx(className)}
    />
  )
);

export const EditorValue = React.forwardRef(
  (
    {
      className,
      value,
      ...props
    }: PropsWithChildren<
      {
        value: any;
      } & BaseProps
    >,
    ref: Ref<OrNull<null>>
  ) => {
    const textLines = value.document.nodes
      .map((node: any) => node.text)
      .toArray()
      .join("\n");
    return (
      <div
        ref={ref as any}
        {...props}
        style={{
          margin: "30px -20px 0",
        }}
        className={cx(className)}
      >
        <div
          style={{
            fontSize: 14,
            padding: "5px 20px",
            color: "#404040",
            borderTop: "2px solid #eeeeee",
            backgroundColor: "#f8f8f8",
          }}
        >
          Slate's value as text
        </div>
        <div
          style={{
            color: "#404040",
            font: "12px monospace",
            whiteSpace: "pre-wrap",
            padding: "10px 20px",
          }}
        >
          {textLines}
        </div>
      </div>
    );
  }
);

export const Icon = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<OrNull<HTMLSpanElement>>
  ) => (
    <span
      {...props}
      ref={ref as any}
      style={{ fontSize: 18, verticalAlign: "text-bottom" }}
      className={cx("material-icons", className)}
    />
  )
);

export const Instruction = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<OrNull<HTMLDivElement>>
  ) => (
    <div
      {...props}
      ref={ref as any}
      style={{
        whiteSpace: "pre-wrap",
        margin: "0 -20px 10px",
        padding: "10px 20px",
        fontSize: 14,
        backgroundColor: "#f8f8f8",
      }}
    />
  )
);

export const Menu = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<OrNull<HTMLDivElement>>
  ) => <div {...props} ref={ref as any} />
);

export const Portal = ({ children }: any) => {
  return typeof document === "object"
    ? ReactDOM.createPortal(children, document.body)
    : null;
};

export const Toolbar = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<OrNull<HTMLDivElement>>
  ) => (
    <Menu
      {...props}
      ref={ref as any}
      style={{
        position: "relative",
        padding: "1px 18px 17px",
        margin: "0 -20px",
        borderBottom: "2px solid #eee",
        marginBottom: "20px",
      }}
    />
  )
);
