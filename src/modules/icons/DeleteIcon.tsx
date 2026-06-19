import { Icon } from './Icon';
import { SVGProps } from 'react';

function DeleteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path d="M4 7h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      <path d="M10 3h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      <path
        d="M6 7l1 13a1 1 0 0 0 1 .92h8a1 1 0 0 0 1-.92L18 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path d="M10 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      <path d="M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Icon>
  );
}

export default DeleteIcon;
