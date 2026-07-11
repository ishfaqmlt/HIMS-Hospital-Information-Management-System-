"use client";

import React, { useEffect, useState, useMemo } from "react";
// import { DataTable } from "@/components/data-table/data-table";
// import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {  Select,  SelectContent,  SelectItem,  SelectTrigger,  SelectValue} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


const PatientRegistrationPage = () => {
      const [loading, setLoading] = useState(false);
      const [message, setMessage] = useState(null);
      const [editingId, setEditingId] = useState(null);
      
  return (
    <div>
     
    </div>
  )
}

export default PatientRegistrationPage
