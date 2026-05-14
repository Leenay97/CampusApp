import { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function Icon({ size = 20, children, ...props }: IconProps) {
  return (
    <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg" fill="none" {...props}>
      {children}
    </svg>
  );
}
