/**
 * Timer — domain entity
 * ROOSE-316: Time Entry Data Model
 *
 * Represents an active (or paused) stopwatch for a user within an org.
 * Invariant: at most one running timer per (organizationId, userId).
 */

export interface TimerProps {
  id: string
  organizationId: string
  userId: string
  projectId?: string
  taskId?: string
  startedAt: Date
  pausedAt?: Date
  accumulatedSeconds: number
  isRunning: boolean
}

export class Timer {
  private constructor(private readonly props: TimerProps) {}

  // ------------------------------------------------------------------
  // Factory methods
  // ------------------------------------------------------------------

  /**
   * Start a new timer (generates a fresh UUID).
   */
  static start(
    props: Omit<TimerProps, 'id' | 'accumulatedSeconds' | 'isRunning' | 'startedAt'>
  ): Timer {
    return new Timer({
      ...props,
      id: crypto.randomUUID(),
      startedAt: new Date(),
      accumulatedSeconds: 0,
      isRunning: true,
    })
  }

  /**
   * Reconstitute a Timer from persisted data.
   * Called by the repository when reading from the database.
   */
  static reconstitute(props: TimerProps): Timer {
    return new Timer(props)
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
  get startedAt(): Date {
    return this.props.startedAt
  }
  get pausedAt(): Date | undefined {
    return this.props.pausedAt
  }
  get accumulatedSeconds(): number {
    return this.props.accumulatedSeconds
  }
  get isRunning(): boolean {
    return this.props.isRunning
  }

  // ------------------------------------------------------------------
  // Domain logic
  // ------------------------------------------------------------------

  /**
   * Total elapsed seconds including the current run segment (if running).
   */
  get elapsedSeconds(): number {
    const now = new Date()
    const runStart = this.props.pausedAt ? this.props.pausedAt : this.props.startedAt
    const currentSegment = this.props.isRunning
      ? Math.floor((now.getTime() - runStart.getTime()) / 1000)
      : 0
    return this.props.accumulatedSeconds + currentSegment
  }

  /**
   * Elapsed duration rounded to whole minutes (for converting to a TimeEntry).
   */
  get elapsedMinutes(): number {
    return Math.floor(this.elapsedSeconds / 60)
  }

  /**
   * Pause the timer — returns a new immutable Timer instance.
   */
  pause(): Timer {
    if (!this.props.isRunning) throw new Error('Timer is already paused')
    const now = new Date()
    const segmentSeconds = Math.floor((now.getTime() - this.props.startedAt.getTime()) / 1000)
    return new Timer({
      ...this.props,
      pausedAt: now,
      accumulatedSeconds: this.props.accumulatedSeconds + segmentSeconds,
      isRunning: false,
    })
  }

  /**
   * Resume a paused timer — returns a new immutable Timer instance.
   */
  resume(): Timer {
    if (this.props.isRunning) throw new Error('Timer is already running')
    return new Timer({
      ...this.props,
      startedAt: new Date(),
      pausedAt: undefined,
      isRunning: true,
    })
  }

  // ------------------------------------------------------------------
  // Serialization
  // ------------------------------------------------------------------

  toJSON(): TimerProps {
    return { ...this.props }
  }
}
