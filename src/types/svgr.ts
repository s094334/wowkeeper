import type { ComponentProps, FunctionComponent } from "react";

export type SvgrComponent = FunctionComponent<
  ComponentProps<"svg"> & {
    title?: string;
    titleId?: string;
    desc?: string;
    descId?: string;
  }
>;
