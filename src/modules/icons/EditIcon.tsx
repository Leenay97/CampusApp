import { Icon } from './Icon';
import { SVGProps } from 'react';

function EditIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path
        d="M3 17.25V21h3.75L19.81 7.94a1.5 1.5 0 0 0 0-2.12l-1.63-1.63a1.5 1.5 0 0 0-2.12 0L3 17.25z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14.5 5.5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Icon>
  );
}

export default EditIcon;
