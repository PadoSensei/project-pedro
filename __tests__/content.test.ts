import { describe, expect, it } from 'vitest'
import { getDocSlugs, getAllAgents, getRules } from '../lib/content'

describe('content readers', () => {
  it('returns an array for document slugs', async () => {
    const result = await getDocSlugs('en')
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns an array for agents', async () => {
    const result = await getAllAgents('en')
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns an array for operational rules', async () => {
    const result = await getRules('en')
    expect(Array.isArray(result)).toBe(true)
  })
})
