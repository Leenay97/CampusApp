'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import queries from '@/graphql/queries';
import mutations from '@/graphql/mutations';
import { useApp } from '@/contexts/AppContext';
import { useUser } from '@/contexts/UserContext';
import { useGlobalLoadingMutation } from '@/hooks/useGlobalLoadingMutation';
import CenteredContainer from '@/components/CenteredContainer/CenteredContainer';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import Subtitle from '@/components/Subtitle/Subtitle';
import Loader from '@/components/Loader/Loaader';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton/SecondaryButton';
import Modal from '@/components/Modal/Modal';
import ModalHeader from '@/components/Modal/ModalHeader';
import ModalBody from '@/components/Modal/ModalBody';
import ModalFooter from '@/components/Modal/ModalFooter';
import { CreateIpodPairModal } from '@/components/CreateIpodPairModal/CreateIpodPairModal';
import { InputField } from '@/components/InputField/InputField';
import ChevronIcon from '@/components/Icons/ChevronIcon/ChevronIcon';
import { IpodMatch, IpodPair, IpodRoundName, UserLevel } from '@/app/types';
import styles from './Ipod.module.scss';

function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isMatchToday(match: IpodMatch): boolean {
  if (!match.date) return false;
  const matchDate = new Date(match.date);
  const now = new Date();
  return (
    matchDate.getFullYear() === now.getFullYear() &&
    matchDate.getMonth() === now.getMonth() &&
    matchDate.getDate() === now.getDate()
  );
}

function toDateInputValue(date: string): string {
  const parsed = new Date(date);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function IpodPage() {
  const { app } = useApp();
  const { user } = useUser();
  const seasonId = app?.seasonId;
  const isStaff = user?.userLevel === UserLevel.Teacher || user?.userLevel === UserLevel.Admin;
  const isAdmin = user?.userLevel === UserLevel.Admin;

  const [isAddPairOpen, setIsAddPairOpen] = useState(false);
  const [selectedWaitingPairIds, setSelectedWaitingPairIds] = useState<string[]>([]);
  const [pairPendingDelete, setPairPendingDelete] = useState<IpodPair | null>(null);
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set());
  const [roundPendingRename, setRoundPendingRename] = useState<number | null>(null);
  const [roundNameInput, setRoundNameInput] = useState('');
  const [winnerPendingConfirm, setWinnerPendingConfirm] = useState<{
    matchId: string;
    pairId: string;
    pairName: string;
  } | null>(null);
  const [matchDate, setMatchDate] = useState(todayDateString());
  const [matchDatePendingEdit, setMatchDatePendingEdit] = useState<{
    matchId: string;
    date: string;
  } | null>(null);

  const { data: studentsData } = useQuery(queries.GET_SEASON_STUDENTS, { skip: !isStaff });

  const {
    data: tournamentData,
    loading: tournamentLoading,
    refetch: refetchTournament,
  } = useQuery(queries.GET_IPOD_TOURNAMENT, {
    variables: { seasonId },
    skip: !seasonId,
  });

  const {
    data: waitingPairsData,
    loading: waitingPairsLoading,
    refetch: refetchWaitingPairs,
  } = useQuery(queries.GET_IPOD_WAITING_PAIRS, {
    variables: { seasonId },
    skip: !seasonId,
  });

  const {
    data: matchesData,
    loading: matchesLoading,
    refetch: refetchMatches,
  } = useQuery(queries.GET_IPOD_MATCHES, {
    variables: { seasonId },
    skip: !seasonId,
  });

  const [createIpodPair] = useGlobalLoadingMutation(mutations.CREATE_IPOD_PAIR, {
    onCompleted: () => refetchWaitingPairs(),
  });
  const [deleteIpodPair] = useGlobalLoadingMutation(mutations.DELETE_IPOD_PAIR, {
    onCompleted: () => refetchWaitingPairs(),
  });
  const [createIpodMatch] = useGlobalLoadingMutation(mutations.CREATE_IPOD_MATCH, {
    onCompleted: () => {
      refetchWaitingPairs();
      refetchMatches();
    },
  });
  const [setIpodMatchWinner] = useGlobalLoadingMutation(mutations.SET_IPOD_MATCH_WINNER, {
    onCompleted: () => refetchMatches(),
  });
  const [advanceIpodRound] = useGlobalLoadingMutation(mutations.ADVANCE_IPOD_ROUND, {
    onCompleted: () => {
      refetchTournament();
      refetchWaitingPairs();
    },
  });
  const [setIpodRoundName] = useGlobalLoadingMutation(mutations.SET_IPOD_ROUND_NAME, {
    onCompleted: () => refetchTournament(),
  });
  const [setIpodMatchDate] = useGlobalLoadingMutation(mutations.SET_IPOD_MATCH_DATE, {
    onCompleted: () => refetchMatches(),
  });

  const currentRound: number = tournamentData?.ipodTournament?.currentRound ?? 1;
  const roundNames: IpodRoundName[] = tournamentData?.ipodTournament?.roundNames ?? [];
  const waitingPairs: IpodPair[] = useMemo(
    () => waitingPairsData?.ipodWaitingPairs ?? [],
    [waitingPairsData],
  );
  const matches: IpodMatch[] = useMemo(() => matchesData?.ipodMatches ?? [], [matchesData]);

  function getRoundName(round: number): string {
    return roundNames.find((entry) => entry.round === round)?.name ?? `Тур ${round}`;
  }

  // Учителя и студенты видят только решённые матчи и матчи сегодняшнего дня —
  // остальное (незавершённые матчи прошлых/будущих дней) видит только админ
  const visibleMatches = useMemo(() => {
    if (isAdmin) return matches;
    return matches.filter((match) => match.winner || isMatchToday(match));
  }, [matches, isAdmin]);

  const matchesByRound = useMemo(() => {
    const map = new Map<number, IpodMatch[]>();
    for (const match of visibleMatches) {
      if (!map.has(match.round)) map.set(match.round, []);
      map.get(match.round)?.push(match);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [visibleMatches]);

  const currentRoundMatches = useMemo(
    () => matches.filter((match) => match.round === currentRound),
    [matches, currentRound],
  );
  const canAdvanceRound =
    currentRoundMatches.length > 0 && currentRoundMatches.every((match) => match.winner);

  function toggleWaitingPair(pairId: string) {
    setSelectedWaitingPairIds((prev) => {
      if (prev.includes(pairId)) return prev.filter((id) => id !== pairId);
      if (prev.length >= 3) return prev;
      return [...prev, pairId];
    });
  }

  async function handleAddPair(name: string, studentIds: string[]) {
    if (!seasonId) return;
    try {
      await createIpodPair({ name, studentIds, seasonId });
      setIsAddPairOpen(false);
    } catch {
      return;
    }
  }

  async function handleConfirmDeletePair() {
    if (!pairPendingDelete) return;
    const pairId = pairPendingDelete.id;
    try {
      await deleteIpodPair({ id: pairId });
      setSelectedWaitingPairIds((prev) => prev.filter((id) => id !== pairId));
      setPairPendingDelete(null);
    } catch {
      return;
    }
  }

  async function handleCreateMatch() {
    if (
      selectedWaitingPairIds.length < 2 ||
      selectedWaitingPairIds.length > 3 ||
      !seasonId ||
      !matchDate
    ) {
      return;
    }
    try {
      await createIpodMatch({ pairIds: selectedWaitingPairIds, seasonId, date: matchDate });
      setSelectedWaitingPairIds([]);
      setMatchDate(todayDateString());
    } catch {
      return;
    }
  }

  async function handleConfirmSetWinner() {
    if (!winnerPendingConfirm) return;
    try {
      await setIpodMatchWinner({
        id: winnerPendingConfirm.matchId,
        winnerId: winnerPendingConfirm.pairId,
      });
      setWinnerPendingConfirm(null);
    } catch {
      return;
    }
  }

  async function handleAdvanceRound() {
    if (!seasonId) return;
    try {
      await advanceIpodRound({ seasonId });
    } catch {
      return;
    }
  }

  function toggleRoundExpanded(round: number) {
    setExpandedRounds((prev) => {
      const next = new Set(prev);
      if (next.has(round)) next.delete(round);
      else next.add(round);
      return next;
    });
  }

  function openRenameRound(round: number) {
    setRoundPendingRename(round);
    setRoundNameInput(getRoundName(round));
  }

  async function handleSaveRoundName() {
    if (roundPendingRename === null || !roundNameInput.trim() || !seasonId) return;
    try {
      await setIpodRoundName({ seasonId, round: roundPendingRename, name: roundNameInput.trim() });
      setRoundPendingRename(null);
    } catch {
      return;
    }
  }

  function openEditMatchDate(match: IpodMatch) {
    setMatchDatePendingEdit({ matchId: match.id, date: toDateInputValue(match.date) });
  }

  async function handleSaveMatchDate() {
    if (!matchDatePendingEdit || !matchDatePendingEdit.date) return;
    try {
      await setIpodMatchDate({
        id: matchDatePendingEdit.matchId,
        date: matchDatePendingEdit.date,
      });
      setMatchDatePendingEdit(null);
    } catch {
      return;
    }
  }

  if (tournamentLoading || waitingPairsLoading || matchesLoading) {
    return (
      <CenteredContainer>
        <Section>
          <Loader />
        </Section>
      </CenteredContainer>
    );
  }

  return (
    <CenteredContainer>
      <Section>
        <Title noMargin>iPod Battle</Title>

        {isStaff && currentRound === 1 && (
          <div className={styles['ipod__actions']}>
            <PrimaryButton onClick={() => setIsAddPairOpen(true)}>Добавить пару</PrimaryButton>
          </div>
        )}

        {isStaff && waitingPairs.length > 0 && (
          <div className={styles['ipod__waiting']}>
            <Subtitle noMargin>Ждут соперника — {getRoundName(currentRound)}</Subtitle>
            <div className={styles['ipod__waiting-list']}>
              {waitingPairs.map((pair) => {
                const isSelected = selectedWaitingPairIds.includes(pair.id);
                return (
                  <div key={pair.id} className={styles['ipod__waiting-row']}>
                    {isAdmin ? (
                      <button
                        type="button"
                        className={
                          isSelected
                            ? styles['ipod__waiting-pair--selected']
                            : styles['ipod__waiting-pair']
                        }
                        onClick={() => toggleWaitingPair(pair.id)}
                      >
                        {pair.name}
                      </button>
                    ) : (
                      <span className={styles['ipod__waiting-pair']}>{pair.name}</span>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        className={styles['ipod__delete-pair']}
                        onClick={() => setPairPendingDelete(pair)}
                        aria-label="Удалить пару"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {isAdmin && (
              <div className={styles['ipod__create-match']}>
                <InputField type="date" value={matchDate} onChange={setMatchDate} />
                <PrimaryButton
                  disabled={
                    selectedWaitingPairIds.length < 2 ||
                    selectedWaitingPairIds.length > 3 ||
                    !matchDate
                  }
                  onClick={handleCreateMatch}
                >
                  Создать матч
                </PrimaryButton>
              </div>
            )}
          </div>
        )}

        {isAdmin && (
          <div className={styles['ipod__advance']}>
            <PrimaryButton disabled={!canAdvanceRound} onClick={handleAdvanceRound}>
              Закрыть «{getRoundName(currentRound)}» и начать «{getRoundName(currentRound + 1)}»
            </PrimaryButton>
          </div>
        )}

        <div className={styles['ipod__matches']}>
          {!visibleMatches.length && <div className={styles['ipod__empty']}>Матчей пока нет</div>}
          {matchesByRound.map(([round, roundMatches]) => {
            const isCurrent = round === currentRound;
            const isExpanded = isCurrent || expandedRounds.has(round);
            return (
              <div key={round} className={styles['ipod__round']}>
                <div
                  className={styles['ipod__round-header']}
                  onClick={isCurrent ? undefined : () => toggleRoundExpanded(round)}
                >
                  <Subtitle noMargin>{getRoundName(round)}</Subtitle>
                  {isAdmin && (
                    <button
                      type="button"
                      className={styles['ipod__round-rename']}
                      onClick={(event) => {
                        event.stopPropagation();
                        openRenameRound(round);
                      }}
                      aria-label="Переименовать тур"
                    >
                      ✎
                    </button>
                  )}
                  {!isCurrent && <ChevronIcon isOpen={isExpanded} />}
                </div>
                {isExpanded &&
                  roundMatches.map((match) => (
                    <div key={match.id} className={styles['ipod__match']}>
                      {isAdmin && (
                        <div className={styles['ipod__match-date']}>
                          {new Date(match.date).toLocaleDateString('ru-RU')}
                          <button
                            type="button"
                            className={styles['ipod__round-rename']}
                            onClick={() => openEditMatchDate(match)}
                            aria-label="Изменить дату матча"
                          >
                            ✎
                          </button>
                        </div>
                      )}
                      <div className={styles['ipod__match-badges']}>
                        {match.pairs.map((pair) => {
                          const isWinner = match.winner?.id === pair.id;
                          const canPickWinner =
                            isAdmin && !isWinner && match.round === currentRound;
                          return (
                            <div
                              key={pair.id}
                              className={
                                isWinner
                                  ? styles['ipod__badge--winner']
                                  : canPickWinner
                                    ? styles['ipod__badge--clickable']
                                    : styles['ipod__badge']
                              }
                              onClick={
                                canPickWinner
                                  ? () =>
                                      setWinnerPendingConfirm({
                                        matchId: match.id,
                                        pairId: pair.id,
                                        pairName: pair.name,
                                      })
                                  : undefined
                              }
                            >
                              {pair.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </Section>

      {isAddPairOpen && (
        <CreateIpodPairModal
          students={studentsData?.seasonStudents ?? []}
          onClose={() => setIsAddPairOpen(false)}
          onCreate={handleAddPair}
        />
      )}

      {pairPendingDelete && (
        <Modal onClose={() => setPairPendingDelete(null)}>
          <ModalHeader title="Удалить пару" onClose={() => setPairPendingDelete(null)} />
          <ModalBody>Удалить «{pairPendingDelete.name}»?</ModalBody>
          <ModalFooter>
            <SecondaryButton onClick={() => setPairPendingDelete(null)}>Отмена</SecondaryButton>
            <PrimaryButton onClick={handleConfirmDeletePair}>Удалить</PrimaryButton>
          </ModalFooter>
        </Modal>
      )}

      {roundPendingRename !== null && (
        <Modal onClose={() => setRoundPendingRename(null)}>
          <ModalHeader title="Название тура" onClose={() => setRoundPendingRename(null)} />
          <ModalBody>
            <InputField
              value={roundNameInput}
              onChange={setRoundNameInput}
              placeholder="Название тура"
            />
          </ModalBody>
          <ModalFooter>
            <SecondaryButton onClick={() => setRoundPendingRename(null)}>Отмена</SecondaryButton>
            <PrimaryButton disabled={!roundNameInput.trim()} onClick={handleSaveRoundName}>
              Сохранить
            </PrimaryButton>
          </ModalFooter>
        </Modal>
      )}

      {winnerPendingConfirm && (
        <Modal onClose={() => setWinnerPendingConfirm(null)}>
          <ModalHeader title="Победитель матча" onClose={() => setWinnerPendingConfirm(null)} />
          <ModalBody>Отметить победителем «{winnerPendingConfirm.pairName}»?</ModalBody>
          <ModalFooter>
            <SecondaryButton onClick={() => setWinnerPendingConfirm(null)}>Отмена</SecondaryButton>
            <PrimaryButton onClick={handleConfirmSetWinner}>Подтвердить</PrimaryButton>
          </ModalFooter>
        </Modal>
      )}

      {matchDatePendingEdit && (
        <Modal onClose={() => setMatchDatePendingEdit(null)}>
          <ModalHeader title="Дата матча" onClose={() => setMatchDatePendingEdit(null)} />
          <ModalBody>
            <InputField
              type="date"
              value={matchDatePendingEdit.date}
              onChange={(value) =>
                setMatchDatePendingEdit((prev) => (prev ? { ...prev, date: value } : prev))
              }
            />
          </ModalBody>
          <ModalFooter>
            <SecondaryButton onClick={() => setMatchDatePendingEdit(null)}>Отмена</SecondaryButton>
            <PrimaryButton disabled={!matchDatePendingEdit.date} onClick={handleSaveMatchDate}>
              Сохранить
            </PrimaryButton>
          </ModalFooter>
        </Modal>
      )}
    </CenteredContainer>
  );
}
