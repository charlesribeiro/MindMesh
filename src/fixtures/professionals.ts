import type { Professional } from '../domain/types'

export const professionals: Professional[] = [
  {
    id: 'pro-maya-chen',
    displayName: 'Maya Chen',
    credentials: 'LCSW',
    specialties: ['anxiety', 'life transitions', 'young adults'],
    modalities: ['telehealth', 'in-person'],
    languages: ['English', 'Mandarin'],
    locationLabel: 'Brooklyn, NY',
    availability: 'accepting',
    acceptingNewClients: true,
  },
  {
    id: 'pro-jordan-rivera',
    displayName: 'Jordan Rivera',
    credentials: 'LMFT',
    specialties: ['relationships', 'family systems', 'stress'],
    modalities: ['telehealth'],
    languages: ['English', 'Spanish'],
    locationLabel: 'Austin, TX',
    availability: 'waitlist',
    acceptingNewClients: false,
  },
  {
    id: 'pro-samira-okonkwo',
    displayName: 'Samira Okonkwo',
    credentials: 'PhD',
    specialties: ['trauma-informed care', 'grief', 'identity'],
    modalities: ['in-person', 'telehealth'],
    languages: ['English'],
    locationLabel: 'Chicago, IL',
    availability: 'accepting',
    acceptingNewClients: true,
  },
]
