import axios from 'axios';
import { CreateEventDTO } from '../types/event';

export const createEvent = async (
  data: CreateEventDTO,
  token: string
) => {
  return axios.post('http://localhost:8080/events', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};