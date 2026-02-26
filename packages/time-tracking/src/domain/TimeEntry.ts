/**
 * TimeEntry — domain entity
 * ROOSE-316: Time Entry Data Model
 *
 * Immutable aggregate root. All mutations return new instances.
 */

export interface TimeEntryProps {
  id: string
  organizationId: string
  userId: string
  projectId?: string
  taskId?: string
  description?: string
  durationMinutes: number
  startedAt: Date
  endedAt?: Date
  billable: boolean
  hourlyRate?: number
  notes?: string
}

export class TimeEntry {
  private constructor(private readonly props: TimeEntryProps) {}

  // ------------------------------------------------------------------
  // Factory methods
  // ------------------------------------------------------------------

  /**
   * Create a new TimeEntry (generates a fresh UUID).
   * Called when a user submits a new time log.
   */
  static create(props: Omit<TimeEntryProps, 'id'>): TimeEntry {
    if (props.durationMinutes < 0) {
      throw new Error('Duration cannot be negative')
    }
    if (props.endedAt && props.endedAt < props.startedAt) {
      throw new Error('endedAt cannot be before startedAt')
    }
    return new TimeEntry({ ...props, id: crypto.randomUUID() })
  }

  /**
   * Reconstitute a TimeEntry from persisted data (no UUID generation).
   * Called by the repository when reading from the database.
   */
  static reconstitute(props: TimeEntryProps): TimeEntry {
    return new TimeEntry(props)
  }

  // ------------------------------------------------------------------
  // Getters
  // ------------------------------------------------------------------

  get id(): string {
    return this.props.id
  }
  get organizationId(): string {
    return this.props.organizationId
  }
  get userId(): string {
    return this.props.userId
  }
  get projectId(): string | undefined {
    return this.props.projectId
  }
  get taskId(): string | undefined {
    return this.props.taskId
  }
  get description(): string | undefined {
    return this.props.description
  }
  get durationMinutes(): number {
    return this.props.durationMinutes
  }
  get startedAt(): Date {
    return this.props.startedAt
  }
  get endedAt(): Date | undefined {
    return this.props.endedAt
  }
  get billable(): boolean {
    return this.props.billable
  }
  get hourlyRate(): number | undefined {
    return this.props.hourlyRate
  }
  get notes(): string | undefined {
    return this.props.notes
  }

  // ------------------------------------------------------------------
  // Domain logic
  // ------------------------------------------------------------------

  /**
   * Calculated billable amount for this entry.
   * Returns undefined when the entry is non-billable or no rate is set.
   */
  get billableAmount(): number | undefined {
    if (!this.props.billable || !this.props.hourlyRate) return undefined
    return (this.props.durationMinutes / 60) * this.props.hourlyRate
  }

  /**
   * Returns a new TimeEntry with updated description (immutable).
   */
  withDescription(description: string): TimeEntry {
    return new TimeEntry({ ...this.props, description })
  }

  /**
   * Returns a new TimeEntry marked as non-billable (immutable).
   */
  markNonBillable(): TimeEntry {
    return new TimeEntry({ ...this.props, billable: false, hourlyRate: undefined })
  }

  /**
   * Returns a new TimeEntry with an updated hourly rate (immutable).
   */
  withHourlyRate(rate: number): TimeEntry {
    if (rate < 0) throw new Error('Hourly rate cannot be negative')
    return new TimeEntry({ ...this.props, hourlyRate: rate })
  }

  // ------------------------------------------------------------------
  // Serialization
  // ------------------------------------------------------------------

  toJSON(): TimeEntryProps {
    return { ...this.props }
  }
}
