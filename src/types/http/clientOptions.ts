/* eslint-disable @typescript-eslint/no-explicit-any */
type HttpVerb =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'
  | 'CONNECT'
  | 'TRACE'

export interface HttpOptions {
  method: HttpVerb
  headers?: Record<string, any>
  query?: Record<string, any>
  body?: BodyInit | null
}
