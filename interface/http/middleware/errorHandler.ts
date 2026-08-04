import { Request, Response, NextFunction } from 'express'
import { AppError } from '../../../core/errors/AppError'

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction): void {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: error.code,
      message: error.message
    })
    return
  }

  if (error instanceof Error) {
    response.status(500).json({
      error: 'INTERNAL_ERROR',
      message: error.message
    })
    return
  }

  response.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Unexpected error'
  })
}

export function asyncHandler(
  handler: (request: Request, response: Response) => Promise<void>
) {
  return (request: Request, response: Response, next: NextFunction): void => {
    handler(request, response).catch(next)
  }
}
