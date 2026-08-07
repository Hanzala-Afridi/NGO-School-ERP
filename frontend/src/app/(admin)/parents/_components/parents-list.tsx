'use client'

import { useActionState, useState } from 'react'
import type { Parent } from '@ngo-school-erp/contracts'

import { createParentAction, updateParentAction } from '@/app/admin/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ParentsListProps {
  parents: Parent[]
  profiles: Array<{ id: string; fullName: string; email: string }>
}

export function ParentsList({ parents, profiles }: ParentsListProps) {
  const [createState, createAction, createPending] = useActionState(createParentAction, {})
  const [updateState, updateAction, updatePending] = useActionState(updateParentAction, {})

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editParent, setEditParent] = useState<Parent | null>(null)
  const [search, setSearch] = useState('')

  const filtered = parents.filter(
    (p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone && p.phone.includes(search)) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parents Directory</h1>
          <p className="text-sm text-muted-foreground">Manage parent domain profiles and contact details</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Create Parent Profile</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Parent Domain Record</DialogTitle>
            </DialogHeader>
            <form action={createAction} className="space-y-4 pt-2">
              {createState?.error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {createState.error}
                </div>
              )}
              {createState?.message && (
                <div className="rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                  {createState.message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="profileId">Select User Profile</Label>
                <Select name="profileId" defaultValue={profiles[0]?.id ?? ''}>
                  <SelectTrigger id="profileId">
                    <SelectValue placeholder="Select user profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.fullName} ({prof.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" placeholder="Parent Name" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" placeholder="+92 300 1234567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="parent@example.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input id="occupation" name="occupation" placeholder="Business / Government Service / Teacher" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" placeholder="Residential Address" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPending}>
                  {createPending ? 'Creating...' : 'Create Parent'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>All Parent Records</CardTitle>
              <CardDescription>Total {filtered.length} parent profiles listed</CardDescription>
            </div>
            <Input
              placeholder="Search parent name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No parent records found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((parent) => (
                  <TableRow key={parent.id}>
                    <TableCell className="font-medium">{parent.fullName}</TableCell>
                    <TableCell>{parent.phone ?? 'N/A'}</TableCell>
                    <TableCell>{parent.email ?? 'N/A'}</TableCell>
                    <TableCell>{parent.occupation ?? 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={parent.status === 'active' ? 'default' : 'secondary'}>
                        {parent.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setEditParent(parent)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editParent && (
        <Dialog open={!!editParent} onOpenChange={(o) => !o && setEditParent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Parent Profile</DialogTitle>
            </DialogHeader>
            <form action={updateAction} className="space-y-4 pt-2">
              <input type="hidden" name="id" value={editParent.id} />
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
                <Label htmlFor="edit-fullName">Full Name</Label>
                <Input id="edit-fullName" name="fullName" defaultValue={editParent.fullName} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input id="edit-phone" name="phone" defaultValue={editParent.phone ?? ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" name="email" defaultValue={editParent.email ?? ''} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-occupation">Occupation</Label>
                <Input id="edit-occupation" name="occupation" defaultValue={editParent.occupation ?? ''} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select name="status" defaultValue={editParent.status}>
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditParent(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePending}>
                  {updatePending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
