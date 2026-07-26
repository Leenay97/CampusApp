import { Icon } from './Icon';
import { SVGProps } from 'react';

function PinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path
        d="M9 3h6l-1 5 3.5 3.5V14H6.5v-2.5L10 8 9 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 14v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Icon>
  );
}

export default PinIcon;
