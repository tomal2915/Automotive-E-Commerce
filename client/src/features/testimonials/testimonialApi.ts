import { api } from "../../lib/api";

export interface Testimonial {
  _id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar: string;
  isActive: boolean;
  displayOrder: number;
}

export const fetchTestimonials = async (): Promise<Testimonial[]> => {
  const res = await api.get("/testimonials");
  return res.data.testimonials;
};

export const fetchAllTestimonialsAdmin = async (): Promise<Testimonial[]> => {
  const res = await api.get("/testimonials/admin/all");
  return res.data.testimonials;
};

export interface TestimonialInput {
  name: string;
  role: string;
  quote: string;
  rating: number;
  displayOrder: number;
  avatar?: File;
}

const buildFormData = (data: TestimonialInput) => {
  const fd = new FormData();
  fd.append("name", data.name);
  fd.append("role", data.role);
  fd.append("quote", data.quote);
  fd.append("rating", String(data.rating));
  fd.append("displayOrder", String(data.displayOrder));
  if (data.avatar) fd.append("avatar", data.avatar);
  return fd;
};

export const createTestimonialRequest = async (
  data: TestimonialInput,
): Promise<Testimonial> => {
  const res = await api.post("/testimonials", buildFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.testimonial;
};

export const updateTestimonialRequest = async (
  id: string,
  data: Partial<TestimonialInput>,
): Promise<Testimonial> => {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined)
      fd.append(key, value instanceof File ? value : String(value));
  });
  const res = await api.put(`/testimonials/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.testimonial;
};

export const toggleTestimonialActiveRequest = async (
  id: string,
  isActive: boolean,
) => {
  const res = await api.put(`/testimonials/${id}`, {
    isActive: String(isActive),
  });
  return res.data.testimonial;
};

export const deleteTestimonialRequest = async (id: string) => {
  const res = await api.delete(`/testimonials/${id}`);
  return res.data;
};
