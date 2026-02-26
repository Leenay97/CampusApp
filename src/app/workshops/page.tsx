import { JSX } from 'react';
import Workshop from '@components/Workshop/Workshop';
import style from './style.module.scss';

export default function WorkShopsPage(): JSX.Element {
  return (
    <div className="centered-container">
      <div className={style['workshops-wrapper']}>
        <Workshop
          name="Бить камни камнями"
          studentAmount={5}
          maxStudentAmount={10}
          place="Каменная сцена"
          teacher="Mackenzie"
        />
        <Workshop
          name="Бить камни камнями"
          studentAmount={5}
          maxStudentAmount={10}
          place="Каменная сцена"
          teacher="Mackenzie"
        />
        <Workshop
          name="Бить камни камнями"
          studentAmount={5}
          maxStudentAmount={10}
          place="Каменная сцена"
          teacher="Mackenzie"
        />
      </div>
    </div>
  );
}
