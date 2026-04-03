'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Shield, 
  Mail, 
  Calendar, 
  Edit, 
  Trash2, 
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [updating, setUpdating] = useState(false)
  
  const supabase = createClient()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setUsers(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleUpdateRole = async (newRole: string) => {
    if (!selectedUser) return
    setUpdating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.id === selectedUser.id && newRole !== 'admin') {
        toast.error('No puedes quitarte el permiso de Administrador a ti mismo.')
        setIsDialogOpen(false)
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', selectedUser.id)
      
      if (error) throw error
      toast.success('Rol actualizado con éxito')
      setIsDialogOpen(false)
      fetchUsers()
    } catch (error: any) {
      toast.error('Error: ' + error.message)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-4">
            <Users className="h-10 w-10 text-primary" />
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Control total sobre roles y accesos del catálogo.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Usuario</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Email</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Rol</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Registro</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Cargando perfiles...</p>
                </TableCell>
              </TableRow>
            ) : users.map((u) => (
              <TableRow key={u.id} className="hover:bg-slate-50/80 border-gray-100 transition-colors group">
                <TableCell className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 h-10 w-10 rounded-xl flex items-center justify-center font-black text-slate-900 uppercase">
                      {u.email[0]}
                    </div>
                    <span className="font-bold text-slate-900">Usuario Premium</span>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <Mail className="h-4 w-4" />
                    {u.email}
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <Badge 
                    className={`font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg border-none ${
                      u.role === 'admin' ? 'bg-indigo-50 text-indigo-700' : 
                      u.role === 'editor' ? 'bg-amber-50 text-amber-700' : 
                      'bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(u.created_at), 'dd MMM yyyy', { locale: es })}
                  </div>
                </TableCell>
                <TableCell className="py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      onClick={() => {
                        setSelectedUser(u)
                        setIsDialogOpen(true)
                      }}
                      variant="ghost" 
                      size="sm" 
                      className="h-10 w-10 rounded-xl p-0 hover:bg-slate-100"
                    >
                      <Edit className="h-4 w-4 text-slate-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-8 border-none bg-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">Cambiar Rol</DialogTitle>
            <DialogDescription className="font-medium text-sm text-muted-foreground">
              Define los permisos de acceso para {selectedUser?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-900">Seleccionar Rol</label>
              <Select 
                defaultValue={selectedUser?.role} 
                onValueChange={handleUpdateRole}
                disabled={updating}
              >
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none focus:ring-primary shadow-none font-bold">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                  <SelectItem value="client" className="rounded-xl px-4 py-3 font-medium">Cliente (Solo perfil)</SelectItem>
                  <SelectItem value="editor" className="rounded-xl px-4 py-3 font-medium">Editor (Gestión de contenido)</SelectItem>
                  <SelectItem value="admin" className="rounded-xl px-4 py-3 font-medium text-indigo-600 font-bold">Admin (Control Total)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {updating && (
              <div className="flex items-center justify-center gap-2 text-primary animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Actualizando niveles de acceso...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
