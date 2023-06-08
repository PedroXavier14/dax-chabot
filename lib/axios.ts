import axios from "axios";
import { API_HOST } from "../environmentVariables";

export const api = axios.create({
  baseURL: API_HOST,
});
