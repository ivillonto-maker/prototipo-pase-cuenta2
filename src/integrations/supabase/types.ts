export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      actuaciones: {
        Row: {
          created_at: string
          created_by: string | null
          descripcion: string | null
          estado: string
          expediente_id: string
          fecha: string
          hora: string | null
          id: string
          lugar: string | null
          notas: string | null
          personas_presentes: string | null
          proximo_seguimiento: string | null
          responsable: string
          tipo: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          estado?: string
          expediente_id: string
          fecha?: string
          hora?: string | null
          id?: string
          lugar?: string | null
          notas?: string | null
          personas_presentes?: string | null
          proximo_seguimiento?: string | null
          responsable?: string
          tipo: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          estado?: string
          expediente_id?: string
          fecha?: string
          hora?: string | null
          id?: string
          lugar?: string | null
          notas?: string | null
          personas_presentes?: string | null
          proximo_seguimiento?: string | null
          responsable?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "actuaciones_expediente_id_fkey"
            columns: ["expediente_id"]
            isOneToOne: false
            referencedRelation: "expedientes"
            referencedColumns: ["id"]
          },
        ]
      }
      contactos: {
        Row: {
          actual: boolean
          ambito: string
          created_at: string
          created_by: string | null
          id: string
          observacion: string
          persona: string
          tipo: string
          valor: string
        }
        Insert: {
          actual?: boolean
          ambito: string
          created_at?: string
          created_by?: string | null
          id?: string
          observacion?: string
          persona: string
          tipo: string
          valor?: string
        }
        Update: {
          actual?: boolean
          ambito?: string
          created_at?: string
          created_by?: string | null
          id?: string
          observacion?: string
          persona?: string
          tipo?: string
          valor?: string
        }
        Relationships: []
      }
      documentos: {
        Row: {
          asunto: string
          created_at: string
          created_by: string | null
          destinatario: string | null
          estado: string
          expediente_id: string | null
          fecha: string
          id: string
          movimiento: string
          remitente: string | null
          responsable: string
          tipo: string
        }
        Insert: {
          asunto?: string
          created_at?: string
          created_by?: string | null
          destinatario?: string | null
          estado?: string
          expediente_id?: string | null
          fecha?: string
          id?: string
          movimiento?: string
          remitente?: string | null
          responsable?: string
          tipo: string
        }
        Update: {
          asunto?: string
          created_at?: string
          created_by?: string | null
          destinatario?: string | null
          estado?: string
          expediente_id?: string | null
          fecha?: string
          id?: string
          movimiento?: string
          remitente?: string | null
          responsable?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_expediente_id_fkey"
            columns: ["expediente_id"]
            isOneToOne: false
            referencedRelation: "expedientes"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_generados: {
        Row: {
          autor: string
          caso_id: string
          created_at: string
          created_by: string | null
          equipo: string
          expediente_codigo: string
          file_path: string
          id: string
          modelo_nombre: string
          nna_nombre: string
          nombre_archivo: string
          tipo_actuacion: string
        }
        Insert: {
          autor?: string
          caso_id: string
          created_at?: string
          created_by?: string | null
          equipo: string
          expediente_codigo: string
          file_path: string
          id?: string
          modelo_nombre: string
          nna_nombre: string
          nombre_archivo: string
          tipo_actuacion: string
        }
        Update: {
          autor?: string
          caso_id?: string
          created_at?: string
          created_by?: string | null
          equipo?: string
          expediente_codigo?: string
          file_path?: string
          id?: string
          modelo_nombre?: string
          nna_nombre?: string
          nombre_archivo?: string
          tipo_actuacion?: string
        }
        Relationships: []
      }
      expedientes: {
        Row: {
          codigo: string
          contacto: string | null
          created_at: string
          created_by: string | null
          direccion_pti: string | null
          direccion_reniec: string | null
          dni: string | null
          especialista: string
          estado: string
          etapa: string
          fecha_ingreso: string
          fecha_nacimiento: string | null
          id: string
          madre: string | null
          motivo_ingreso: string | null
          nna_iniciales: string
          nna_nombre: string
          observaciones: string | null
          padre: string | null
          prioridad: string
          procedencia: string | null
          responsable_actual: string | null
          updated_at: string
        }
        Insert: {
          codigo: string
          contacto?: string | null
          created_at?: string
          created_by?: string | null
          direccion_pti?: string | null
          direccion_reniec?: string | null
          dni?: string | null
          especialista?: string
          estado?: string
          etapa?: string
          fecha_ingreso?: string
          fecha_nacimiento?: string | null
          id?: string
          madre?: string | null
          motivo_ingreso?: string | null
          nna_iniciales?: string
          nna_nombre: string
          observaciones?: string | null
          padre?: string | null
          prioridad?: string
          procedencia?: string | null
          responsable_actual?: string | null
          updated_at?: string
        }
        Update: {
          codigo?: string
          contacto?: string | null
          created_at?: string
          created_by?: string | null
          direccion_pti?: string | null
          direccion_reniec?: string | null
          dni?: string | null
          especialista?: string
          estado?: string
          etapa?: string
          fecha_ingreso?: string
          fecha_nacimiento?: string | null
          id?: string
          madre?: string | null
          motivo_ingreso?: string | null
          nna_iniciales?: string
          nna_nombre?: string
          observaciones?: string | null
          padre?: string | null
          prioridad?: string
          procedencia?: string | null
          responsable_actual?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      expedientes_archivo: {
        Row: {
          autor: string
          created_at: string
          created_by: string | null
          fid: string
        }
        Insert: {
          autor?: string
          created_at?: string
          created_by?: string | null
          fid: string
        }
        Update: {
          autor?: string
          created_at?: string
          created_by?: string | null
          fid?: string
        }
        Relationships: []
      }
      modelos: {
        Row: {
          created_at: string
          created_by: string | null
          file_path: string
          id: string
          nombre: string
          tipo_actuacion: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_path: string
          id?: string
          nombre: string
          tipo_actuacion: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_path?: string
          id?: string
          nombre?: string
          tipo_actuacion?: string
          updated_at?: string
        }
        Relationships: []
      }
      nna_registros: {
        Row: {
          caso_base: string | null
          created_at: string
          created_by: string | null
          dni: string
          eliminado: boolean
          expediente_codigo: string
          fecha_nacimiento: string | null
          id: string
          nombre: string
        }
        Insert: {
          caso_base?: string | null
          created_at?: string
          created_by?: string | null
          dni?: string
          eliminado?: boolean
          expediente_codigo: string
          fecha_nacimiento?: string | null
          id?: string
          nombre?: string
        }
        Update: {
          caso_base?: string | null
          created_at?: string
          created_by?: string | null
          dni?: string
          eliminado?: boolean
          expediente_codigo?: string
          fecha_nacimiento?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      pendientes: {
        Row: {
          actividad: string
          created_at: string
          created_by: string | null
          estado: string
          expediente_id: string | null
          fecha_limite: string
          id: string
          responsable: string
        }
        Insert: {
          actividad: string
          created_at?: string
          created_by?: string | null
          estado?: string
          expediente_id?: string | null
          fecha_limite?: string
          id?: string
          responsable?: string
        }
        Update: {
          actividad?: string
          created_at?: string
          created_by?: string | null
          estado?: string
          expediente_id?: string | null
          fecha_limite?: string
          id?: string
          responsable?: string
        }
        Relationships: [
          {
            foreignKeyName: "pendientes_expediente_id_fkey"
            columns: ["expediente_id"]
            isOneToOne: false
            referencedRelation: "expedientes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activo: boolean
          cargo: string
          created_at: string
          email: string
          full_name: string
          id: string
        }
        Insert: {
          activo?: boolean
          cargo?: string
          created_at?: string
          email?: string
          full_name?: string
          id: string
        }
        Update: {
          activo?: boolean
          cargo?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      pti_actuaciones: {
        Row: {
          base_indice: number | null
          caso_id: string
          created_at: string
          created_by: string | null
          descripcion: string
          eliminado: boolean
          fecha: string
          id: string
        }
        Insert: {
          base_indice?: number | null
          caso_id: string
          created_at?: string
          created_by?: string | null
          descripcion?: string
          eliminado?: boolean
          fecha?: string
          id?: string
        }
        Update: {
          base_indice?: number | null
          caso_id?: string
          created_at?: string
          created_by?: string | null
          descripcion?: string
          eliminado?: boolean
          fecha?: string
          id?: string
        }
        Relationships: []
      }
      registro_documentos: {
        Row: {
          accion: string
          autor: string
          caso_id: string
          created_at: string
          detalle: string
          expediente_codigo: string
          id: string
          user_id: string | null
        }
        Insert: {
          accion: string
          autor?: string
          caso_id: string
          created_at?: string
          detalle: string
          expediente_codigo: string
          id?: string
          user_id?: string | null
        }
        Update: {
          accion?: string
          autor?: string
          caso_id?: string
          created_at?: string
          detalle?: string
          expediente_codigo?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      registros_nna: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          data: Json
          fid: string
          id: string
          label: string
          team: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          data: Json
          fid: string
          id: string
          label?: string
          team: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          data?: Json
          fid?: string
          id?: string
          label?: string
          team?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "supervisor" | "especialista"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "supervisor", "especialista"],
    },
  },
} as const
