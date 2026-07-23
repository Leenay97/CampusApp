import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import ScheduleBuilder from '@/components/ScheduleBuilder/ScheduleBuilder';

export default function Schedule() {
  return (
    <CenteredContainer noPaddingTop>
      <ScheduleBuilder editMode />
    </CenteredContainer>
  );
}
