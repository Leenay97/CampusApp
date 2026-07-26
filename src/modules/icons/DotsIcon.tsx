import { Icon } from './Icon';
import { SVGProps } from 'react';

function DotsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="5" r="1.75" fill="currentColor" />
      <circle cx="12" cy="12" r="1.75" fill="currentColor" />
      <circle cx="12" cy="19" r="1.75" fill="currentColor" />
    </Icon>
  );
}

export default DotsIcon;
