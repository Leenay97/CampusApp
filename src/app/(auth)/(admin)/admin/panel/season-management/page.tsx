'use client';

import AddSeasonModal from '@/components/AddSeasonModal/AddSeasonModal';
import { InputField } from '@/components/InputField/InputField';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import Section from '@/components/Section/Section';
import Title from '@/components/Title/Title';
import { useState } from 'react';

// type SeasonDataType = {
//   seasonName?: string;
//   seasonDates?: [Date, Date];
//   seasonGroups?: string[];
//   seasonTeachers?: string[];
// };

function SeasonManagementPage() {
  //   const [seasonData, setSeasonData] = useState<SeasonDataType | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  return (
    <Section>
      <Title>Season Management</Title>
      <PrimaryButton onClick={setIsCreateModalOpen}>Добавить сезон</PrimaryButton>
      {isCreateModalOpen && <AddSeasonModal onClose={() => setIsCreateModalOpen(false)} />}
      {/* <InputField value={seasonData} onChange={setSeasonData} /> */}
    </Section>
  );
}
export default SeasonManagementPage;
