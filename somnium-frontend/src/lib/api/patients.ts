/**
 * Patient and Vitals API Client
 */

import type {
  Patient,
  PatientCreate,
  PatientUpdate,
  PatientWithLatestVitals,
  VitalsTrends,
  VitalsEntryCheck,
} from "@/lib/validations/patient";
import type { VitalsCreate, VitalsRecord } from "@/lib/validations/vitals";
import { apiClient } from "./client";

export const patientsApi = {
  // ============================================================================
  // Patient Operations
  // ============================================================================

  /**
   * Create a new patient
   */
  async createPatient(data: PatientCreate): Promise<Patient> {
    const response = await apiClient.post<Patient>("/api/v1/patients/", data);
    return response.data;
  },

  /**
   * Get a patient by ID
   */
  async getPatient(patientId: string): Promise<Patient> {
    const response = await apiClient.get<Patient>(
      `/api/v1/patients/${patientId}`,
    );
    return response.data;
  },

  /**
   * Get all patients for a hospital
   */
  async getPatientsByHospital(
    hospitalId: string,
    params?: {
      is_active?: boolean;
      limit?: number;
      offset?: number;
    },
  ): Promise<Patient[]> {
    const response = await apiClient.get<Patient[]>(
      `/api/v1/patients/hospital/${hospitalId}`,
      { params },
    );
    return response.data;
  },

  /**
   * Get all active patients for a hospital
   * Used in nurse station for patient selection
   */
  async getActivePatients(hospitalId: string): Promise<Patient[]> {
    const response = await apiClient.get<Patient[]>(
      `/api/v1/patients/hospital/${hospitalId}/active`,
    );
    return response.data;
  },

  /**
   * Get all active patients with their latest vitals
   * Used for dashboard display
   */
  async getPatientsWithLatestVitals(
    hospitalId: string,
  ): Promise<PatientWithLatestVitals[]> {
    const response = await apiClient.get<PatientWithLatestVitals[]>(
      `/api/v1/patients/hospital/${hospitalId}/with-vitals`,
    );
    return response.data;
  },

  /**
   * Update a patient
   */
  async updatePatient(
    patientId: string,
    data: PatientUpdate,
  ): Promise<Patient> {
    const response = await apiClient.patch<Patient>(
      `/api/v1/patients/${patientId}`,
      data,
    );
    return response.data;
  },

  /**
   * Soft delete a patient (set is_active to false)
   */
  async deletePatient(patientId: string): Promise<void> {
    await apiClient.delete(`/api/v1/patients/${patientId}`);
  },

  // ============================================================================
  // Vitals Operations
  // ============================================================================

  /**
   * Check if vitals can be entered for a patient
   * Validates the 12-hour constraint
   */
  async checkCanEnterVitals(patientId: string): Promise<VitalsEntryCheck> {
    const response = await apiClient.get<VitalsEntryCheck>(
      `/api/v1/patients/${patientId}/vitals/check`,
    );
    return response.data;
  },

  /**
   * Create a new vitals entry
   * Enforces 12-hour minimum interval
   */
  async createVitals(data: VitalsCreate): Promise<VitalsRecord> {
    const response = await apiClient.post<VitalsRecord>(
      "/api/v1/patients/vitals",
      data,
    );
    return response.data;
  },

  /**
   * Get the latest vitals for a patient
   */
  async getLatestVitals(patientId: string): Promise<VitalsRecord> {
    const response = await apiClient.get<VitalsRecord>(
      `/api/v1/patients/${patientId}/vitals/latest`,
    );
    return response.data;
  },

  /**
   * Get vitals history for a patient
   * @param hours - Optional filter for last N hours (24, 48, 72, etc.)
   */
  async getVitalsHistory(
    patientId: string,
    params?: {
      hours?: number;
      limit?: number;
      offset?: number;
    },
  ): Promise<VitalsRecord[]> {
    const response = await apiClient.get<VitalsRecord[]>(
      `/api/v1/patients/${patientId}/vitals/history`,
      { params },
    );
    return response.data;
  },

  /**
   * Get vitals trends for graphing
   * @param hours - Optional filter: 24, 48, 72, or omit for all-time
   */
  async getVitalsTrends(
    patientId: string,
    hours?: number,
  ): Promise<VitalsTrends> {
    const params = hours ? { hours } : undefined;
    const response = await apiClient.get<VitalsTrends>(
      `/api/v1/patients/${patientId}/vitals/trends`,
      { params },
    );
    return response.data;
  },
};
