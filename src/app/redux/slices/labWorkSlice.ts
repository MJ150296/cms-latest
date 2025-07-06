import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { LabWorkInput } from "@/schemas/zobLabWorkSchema";
import { Types } from "mongoose";
import { EditableLabWorkFields } from "@/app/components/doctor/EditLabWorkForm";

interface LabWorkPatient {
  _id: Types.ObjectId | string;
  fullName: string;
  contactNumber: string;
}

interface LabWorkDoctor {
  _id: Types.ObjectId | string;
  fullName: string;
  specialization: string;
}

// Type for lab work item (backend model aligned)
export interface ILabWork extends Omit<LabWorkInput, "patientId" | "doctorId"> {
  _id: Types.ObjectId | string;
  createdAt?: string;
  updatedAt?: string;
  patientId: LabWorkPatient; // Changed from string to Patient object
  doctorId: LabWorkDoctor; // Changed from string to Doctor object
}

// State structure
interface LabWorkState {
  data: ILabWork[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: LabWorkState = {
  data: [],
  loading: false,
  error: null,
};

// ⚡ Fetch all lab works
export const fetchLabWorks = createAsyncThunk("labWork/fetchAll", async () => {
  const res = await axios.get<ILabWork[]>("/api/doctor/labWork/fetchAll");
  return res.data;
});

// ➕ Create lab work
export const createLabWork = createAsyncThunk(
  "labWork/create",
  async (payload: LabWorkInput) => {
    const res = await axios.post<ILabWork>("/api/doctor/labwork/add", payload);
    return res.data;
  }
);

// 🔄 Update lab work
export const updateLabWork = createAsyncThunk(
  "labWork/update",
  async ({
    id,
    updates,
  }: {
    id: string;
    updates: Partial<EditableLabWorkFields>;
  }) => {
    const res = await axios.put<ILabWork>(
      `/api/doctor/labWork/update/${id}`,
      updates
    );
    return res.data;
  }
);

// ❌ Delete lab work
export const deleteLabWork = createAsyncThunk(
  "labWork/delete",
  async (id: string) => {
    await axios.delete(`/api/doctor/labWork/delete/${id}`);
    return id;
  }
);

const labWorkSlice = createSlice({
  name: "labWork",
  initialState,
  reducers: {
    clearLabWorkError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLabWorks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabWorks.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchLabWorks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch lab work";
      })

      .addCase(createLabWork.fulfilled, (state, action) => {
        state.data.unshift(action.payload);
      })
      .addCase(updateLabWork.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) state.data[index] = action.payload;
      })
      // Delete cases
      .addCase(deleteLabWork.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLabWork.fulfilled, (state, action) => {
        state.data = state.data.filter((item) => item._id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteLabWork.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to delete lab work";
      });
  },
});

export const { clearLabWorkError } = labWorkSlice.actions;
export default labWorkSlice.reducer;
