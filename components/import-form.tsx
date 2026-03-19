'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, CheckCircle, XCircle, Loader2, Download } from 'lucide-react'

export function ImportForm() {
  const [file, setFile] = useState<File | null>(null)
  const [personName, setPersonName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    imported?: number
    skipped?: number
    errors?: string[]
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (personName) {
        formData.append('person', personName)
      }

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          imported: data.imported,
          skipped: data.skipped,
          errors: data.errors,
        })
        setFile(null)
        setPersonName('')
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setResult({
          success: false,
          message: data.error || 'Import failed',
          errors: data.details ? [data.details] : [],
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to upload file',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Bets from Spreadsheet</CardTitle>
        <CardDescription>
          Upload an .xlsx file with bet data. If the file doesn't have a "Person" column, enter the person's name below.
        </CardDescription>
        <div className="mt-4">
          <a
            href="/api/template"
            download="bet_tracker_template.xlsx"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Download className="h-4 w-4" />
            Download Template Spreadsheet
          </a>
          <p className="text-xs text-muted-foreground mt-2">
            Need help? Download our template to see the required format with example bets.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Excel File (.xlsx)
            </label>
            <Input
              type="file"
              accept=".xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Person Name (optional)
            </label>
            <Input
              type="text"
              placeholder="e.g., Nick"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Only needed if the spreadsheet doesn't have a "Person" column
            </p>
          </div>

          <Button type="submit" disabled={!file || loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Bets
              </>
            )}
          </Button>
        </form>

        {result && (
          <div
            className={`mt-4 p-4 rounded-md ${
              result.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  {result.message}
                </p>
                {result.imported !== undefined && (
                  <p className="text-sm text-green-700 mt-1">
                    Imported: {result.imported} | Skipped: {result.skipped}
                  </p>
                )}
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-900">Errors:</p>
                    <ul className="text-sm text-red-700 list-disc list-inside mt-1">
                      {result.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {result.errors.length > 5 && (
                        <li>... and {result.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
