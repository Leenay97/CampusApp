'use client';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Checkbox from '@/components/Checkbox/Checkbox';
import { InputField } from '@/components/InputField/InputField';
import Loader from '@/components/Loader/Loaader';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton/SecondaryButton';
import Section from '@/components/Section/Section';
import Subtitle from '@/components/Subtitle/Subtitle';
import Title from '@/components/Title/Title';
import { UPDATE_MAZE_RUNNER_EVENT } from '@/graphql/mutations/UpdateMazeRunnerEvent';
import { GET_MAZE_RUNNER_EVENT } from '@/graphql/queries/GetMazeRunnerEvent';
import { GET_MAZE_RUNNER_RESULTS } from '@/graphql/queries/GetMazeRunnerResults';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import { MazeRunnerEvent, MazeRunnerResult } from '@/app/types';
import MazeRunnerResultsTable from '@/components/MazeRunnerResultsTable/MazeRunnerResultsTable';
import { useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';

const CODE_RE = /^\d{4,8}$/;

export default function AdminEventsPage() {
  const { data, loading, refetch } = useQuery(GET_MAZE_RUNNER_EVENT);
  const { data: resultsData, refetch: refetchResults } = useQuery(GET_MAZE_RUNNER_RESULTS);
  const [updateEvent] = useGlobalLoadingMutation(UPDATE_MAZE_RUNNER_EVENT);

  const [code, setCode] = useState('');
  const [isCyclic, setIsCyclic] = useState(false);
  const [codeword, setCodeword] = useState('');
  const [isActive, setIsActive] = useState(false);

  const event: MazeRunnerEvent | undefined = useMemo(() => data?.mazeRunnerEvent, [data]);
  const results: MazeRunnerResult[] = useMemo(
    () => resultsData?.mazeRunnerResults ?? [],
    [resultsData],
  );

  useEffect(() => {
    if (event) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setCode(event.code ?? '');
      setIsCyclic(event.isCyclic);
      setCodeword(event.codeword ?? '');
      setIsActive(event.isActive);
    }
  }, [event]);

  const isCodeValid = CODE_RE.test(code);
  const codeChanged = event?.code !== undefined && code !== (event?.code ?? '');

  async function handleSave() {
    try {
      await updateEvent({ code, isCyclic, codeword, isActive });
      refetch();
      refetchResults();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading)
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );

  return (
    <CenteredContainer noPaddingTop>
      <Section>
        <Title>Maze Runner</Title>

        <div>
          <Subtitle>Код (4-8 цифр)</Subtitle>
          <InputField
            width="240px"
            maxLength={8}
            value={code}
            error={code.length > 0 && !isCodeValid ? 'Только цифры, от 4 до 8 символов' : undefined}
            onChange={(value) => setCode(value.replace(/\D/g, ''))}
          />
        </div>

        <Checkbox
          checked={isCyclic}
          onChange={() => setIsCyclic((prev) => !prev)}
          label={
            <div>
              <span style={{ fontWeight: 'bold' }}>Циклический код</span>
              <br />
              <span style={{ fontSize: '12px', color: 'black' }}>
                (принимать повороты, например <br />
                1234 = 2341 = 3412 = 4123)
              </span>
            </div>
          }
        />

        <div>
          <Subtitle>Кодовое слово (показывается группе после разгадки)</Subtitle>
          <InputField width="240px" value={codeword} onChange={setCodeword} />
        </div>

        <Checkbox
          checked={isActive}
          onChange={() => setIsActive((prev) => !prev)}
          label="Ивент запущен"
        />

        {codeChanged && (
          <div className="error-text">
            Код изменён — при сохранении блокировки и решения всех групп сбросятся.
          </div>
        )}

        <PrimaryButton disabled={!isCodeValid} onClick={handleSave}>
          Сохранить
        </PrimaryButton>
      </Section>

      <Section>
        <Title noMargin>Результаты</Title>
        <SecondaryButton onClick={() => refetchResults()}>Обновить</SecondaryButton>

        <MazeRunnerResultsTable results={results} />
      </Section>
    </CenteredContainer>
  );
}
