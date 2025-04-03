import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AppointmentForm from "../AppointmentForm";
import { act } from "react-dom/test-utils";

// Mock de los datos
const mockDoctors = [
  { nombre: "Dr. Pérez", especialidad: "Cardiología" },
  { nombre: "Dr. Gómez", especialidad: "Pediatría" }
];

const mockSubmit = jest.fn();
const mockToken = "fakeToken";

// Mock de la función de validación
jest.mock("../hooks/useAppointmentFormValidation", () => {
  return jest.fn(() => ({
    errors: {},
    validate: jest.fn((values) => {
      const errors: any = {};
      if (!values.patientName) errors.patientName = "Nombre es obligatorio";
      if (!values.appointmentDate) errors.appointmentDate = "Fecha es obligatoria";
      return errors;
    })
  }));
});

describe("AppointmentForm", () => {
  beforeEach(() => {
    render(<AppointmentForm doctors={mockDoctors} onAppointmentSubmit={mockSubmit} token={mockToken} />);
  });

  test("Debería renderizar correctamente los campos del formulario", () => {
    expect(screen.getByLabelText(/Nombre del Paciente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Seleccionar Doctor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha de la Cita/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /agendar/i })).toBeInTheDocument();
  });

  test("Debería enfocar el campo de Nombre del Paciente al cargar", () => {
    const input = screen.getByLabelText(/Nombre del Paciente/i) as HTMLInputElement;
    expect(input).toHaveFocus();
  });

  test("Debería mostrar un mensaje de error si el formulario no está completo", async () => {
    fireEvent.click(screen.getByRole("button", { name: /agendar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Nombre es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/Fecha es obligatoria/i)).toBeInTheDocument();
    });
  });

  test("Debería enviar el formulario correctamente si todos los campos son válidos", async () => {
    fireEvent.change(screen.getByLabelText(/Nombre del Paciente/i), {
      target: { value: "Juan Pérez" }
    });
    fireEvent.change(screen.getByLabelText(/Seleccionar Doctor/i), {
      target: { value: "Dr. Pérez" }
    });
    fireEvent.change(screen.getByLabelText(/Fecha de la Cita/i), {
      target: { value: "2025-04-05" }
    });

    fireEvent.click(screen.getByRole("button", { name: /agendar/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        patientName: "Juan Pérez",
        doctor: "Dr. Pérez",
        appointmentDate: "2025-04-05"
      });
    });
  });

  test("Debería mostrar un mensaje de éxito cuando la cita se crea correctamente", async () => {
    const fakeResponse = { success: true };

    // Mock de la función fetch para simular una respuesta exitosa
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(fakeResponse)
    });

    fireEvent.change(screen.getByLabelText(/Nombre del Paciente/i), {
      target: { value: "Juan Pérez" }
    });
    fireEvent.change(screen.getByLabelText(/Seleccionar Doctor/i), {
      target: { value: "Dr. Pérez" }
    });
    fireEvent.change(screen.getByLabelText(/Fecha de la Cita/i), {
      target: { value: "2025-04-05" }
    });

    fireEvent.click(screen.getByRole("button", { name: /agendar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Cita creada con éxito/i)).toBeInTheDocument();
    });
  });

  test("Debería mostrar un mensaje de error cuando la API falle", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: "Error al enviar la cita" })
    });

    fireEvent.change(screen.getByLabelText(/Nombre del Paciente/i), {
      target: { value: "Juan Pérez" }
    });
    fireEvent.change(screen.getByLabelText(/Seleccionar Doctor/i), {
      target: { value: "Dr. Pérez" }
    });
    fireEvent.change(screen.getByLabelText(/Fecha de la Cita/i), {
      target: { value: "2025-04-05" }
    });

    fireEvent.click(screen.getByRole("button", { name: /agendar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error al enviar la cita/i)).toBeInTheDocument();
    });
  });
});
