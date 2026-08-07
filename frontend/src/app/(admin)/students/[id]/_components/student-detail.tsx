'use client'

import { useActionState, useState } from 'react'
import type {
  Attachment,
  Parent,
  Student,
  StudentParentLink,
  StudentSiblingLink,
} from '@ngo-school-erp/contracts'

import {
  archiveStudentAction,
  createStudentDocumentAction,
  deleteStudentDocumentAction,
  linkStudentParentAction,
  updateStudentAction,
} from '@/app/admin/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface StudentDetailProps {
  student: Student
  documents: Attachment[]
  parents: Parent[]
  parentLinks: StudentParentLink[]
  siblings: StudentSiblingLink[]
  history: Array<{ event: string; timestamp: string; details: string }>
}

export function StudentDetail({
  student,
  documents,
  parents,
  parentLinks,
}: StudentDetailProps) {
  const [updateState, updateAction, updatePending] = useActionState(updateStudentAction, {})
  const [, archiveAction, archivePending] = useActionState(archiveStudentAction, {})
  const [docState, docAction, docPending] = useActionState(createStudentDocumentAction, {})
  const [, delDocAction, delDocPending] = useActionState(deleteStudentDocumentAction, {})
  const [linkParentState, linkParentAction, linkParentPending] = useActionState(
    linkStudentParentAction,
    {},
  )

  const [docDialogOpen, setDocDialogOpen] = useState(false)
  const [parentDialogOpen, setParentDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{student.fullName}</h1>
            <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
              {student.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground font-mono">Reg #: {student.studentNumber}</p>
        </div>
        <form action={archiveAction}>
          <input type="hidden" name="id" value={student.id} />
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={archivePending || student.status === 'archived'}
          >
            {archivePending ? 'Archiving...' : 'Archive Student Profile'}
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card & Edit */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Personal, admission, and contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateAction} className="space-y-4">
              <input type="hidden" name="id" value={student.id} />
              {updateState?.error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {updateState.error}
                </div>
              )}
              {updateState?.message && (
                <div className="rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                  {updateState.message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" defaultValue={student.fullName} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select name="gender" defaultValue={student.gender}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={student.status}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="transferred">Transferred</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" defaultValue={student.address ?? ''} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyNotes">Emergency & Medical Notes</Label>
                <Input id="emergencyNotes" name="emergencyNotes" defaultValue={student.emergencyNotes ?? ''} />
              </div>

              <Button type="submit" disabled={updatePending}>
                {updatePending ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Linked Parents Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Parents & Guardians</CardTitle>
              <CardDescription>Family links and contact information</CardDescription>
            </div>
            <Dialog open={parentDialogOpen} onOpenChange={setParentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">+ Link Parent</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Link Parent Profile</DialogTitle>
                </DialogHeader>
                <form action={linkParentAction} className="space-y-4 pt-2">
                  <input type="hidden" name="studentId" value={student.id} />
                  {linkParentState?.error && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                      {linkParentState.error}
                    </div>
                  )}
                  {linkParentState?.message && (
                    <div className="rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                      {linkParentState.message}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="parentId">Select Parent</Label>
                    <Select name="parentId" defaultValue={parents[0]?.id ?? ''}>
                      <SelectTrigger id="parentId">
                        <SelectValue placeholder="Select parent profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {parents.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.fullName} ({p.phone ?? p.email ?? 'No contact'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Select name="relationship" defaultValue="father">
                      <SelectTrigger id="relationship">
                        <SelectValue placeholder="Relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="guardian">Guardian</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setParentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={linkParentPending}>
                      {linkParentPending ? 'Linking...' : 'Link Parent'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {parentLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No parents/guardians linked yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parent ID</TableHead>
                    <TableHead>Relationship</TableHead>
                    <TableHead>Primary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parentLinks.map((link) => (
                    <TableRow key={link.parentId}>
                      <TableCell className="font-mono text-xs">{link.parentId.substring(0, 8)}...</TableCell>
                      <TableCell className="capitalize">{link.relationship}</TableCell>
                      <TableCell>{link.isPrimary ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Documents Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Student Documents</CardTitle>
            <CardDescription>Birth certificate, B-Form, school leaving certificate, income proof</CardDescription>
          </div>
          <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">+ Upload Document</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Student Document Metadata</DialogTitle>
              </DialogHeader>
              <form action={docAction} className="space-y-4 pt-2">
                <input type="hidden" name="studentId" value={student.id} />
                {docState?.error && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {docState.error}
                  </div>
                )}
                {docState?.message && (
                  <div className="rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                    {docState.message}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fileName">Document Title / File Name</Label>
                  <Input id="fileName" name="fileName" placeholder="B-Form-Certificate.pdf" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storagePath">Storage Path</Label>
                  <Input id="storagePath" name="storagePath" defaultValue={`student-documents/${student.id}/document.pdf`} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mimeType">File Type</Label>
                    <Select name="mimeType" defaultValue="application/pdf">
                      <SelectTrigger id="mimeType">
                        <SelectValue placeholder="File Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="application/pdf">PDF Document</SelectItem>
                        <SelectItem value="image/png">PNG Image</SelectItem>
                        <SelectItem value="image/jpeg">JPEG Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sizeBytes">File Size (Bytes)</Label>
                    <Input id="sizeBytes" name="sizeBytes" type="number" defaultValue="204800" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDocDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={docPending}>
                    {docPending ? 'Uploading...' : 'Save Document Metadata'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No documents uploaded for this student.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size (KB)</TableHead>
                  <TableHead>Uploaded At</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.fileName}</TableCell>
                    <TableCell className="font-mono text-xs">{doc.mimeType}</TableCell>
                    <TableCell>{(doc.sizeBytes / 1024).toFixed(1)} KB</TableCell>
                    <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <form action={delDocAction} className="inline-block">
                        <input type="hidden" name="studentId" value={student.id} />
                        <input type="hidden" name="documentId" value={doc.id} />
                        <Button type="submit" size="sm" variant="ghost" className="text-destructive hover:text-destructive" disabled={delDocPending}>
                          Remove
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
