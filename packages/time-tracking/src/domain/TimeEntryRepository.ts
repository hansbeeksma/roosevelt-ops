/**
 * TimeEntryRepository — repository interface (port)
 * ROOSE-316: Time Entry Data Model
 *
 * Defines the persistence contract for TimeEntry aggregates.
 * Concrete implementations live in the infrastructure layer.
 */

import { TimeEntry } from './TimeEntry'

export interface TimeEntryFilters {
  from?: Date
  to?: Date
  billable?: boolean
  projectId?: string
}

export interface TimeEntryRepository {
  /**
   * Find a single entry by ID within an organisation.
   * Returns null when not found or soft-deleted.
   */
  findById(id: string, organizationId: string): Promise<TimeEntry | null>

  /**
   * Find all entries for a user within an organisation, with optional date range.
   * Excludes soft-deleted rows.
   */
  findByUser(
    userId: string,
    organizationId: string,
    filters?: TimeEntryFilters
  ): Promise<TimeEntry[]>

  /**
   * Find all entries for a Plane project within an organisation.
   * Excludes soft-deleted rows.
   */
  findByProject(
    projectId: string,
    organizationId: string,
    filters?: Pick<TimeEntryFilters, 'from' | 'to'>
  ): Promise<TimeEntry[]>

  /**
   * Persist a TimeEntry (insert or upsert on id).
   * Returns the stored entity (with any DB-generated defaults).
   */
  save(entry: TimeEntry): Promise<TimeEntry>

  /**
   * Soft-delete a TimeEntry by setting deleted_at and deleted_by.
   * Hard enforcement of org boundary is done via RLS.
   */
  delete(id: string, organizationId: string, deletedBy: string): Promise<void>
}

// ------------------------------------------------------------------
// TimerRepository
// ------------------------------------------------------------------

import { Timer } from './Timer'

export interface TimerRepository {
  /**
   * Find the active timer for a user in an organisation.
   * Returns null when no timer exists.
   */
  findActiveForUser(userId: string, organizationId: string): Promise<Timer | null>

  /**
   * Persist a Timer (insert or upsert on id).
   */
  save(timer: Timer): Promise<Timer>

  /**
   * Delete a timer record permanently (timers have no soft-delete).
   */
  delete(id: string, organizationId: string): Promise<void>
}
