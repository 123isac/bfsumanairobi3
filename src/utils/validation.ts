import { z } from "zod";

const nameRegex = /^[a-zA-Z\s'.-]+$/;

// Checkout form validation schema
export const checkoutSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(nameRegex, "Name contains unsupported characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .regex(/^(?:\+254|0|254)[0-9\s-]{8,12}$/, "Invalid phone format. Use 0700123456 or +254..."),
  address: z.string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be less than 200 characters"),
  city: z.string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be less than 100 characters"),
  postalCode: z.string()
    .max(10, "Postal code must be less than 10 characters")
    .optional(),
});

// Contact form validation schema
export const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .max(20, "Phone must be less than 20 characters")
    .optional(),
  message: z.string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
});

// Partner application form schema
export const partnerApplicationSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters")
    .regex(nameRegex, "Full name contains unsupported characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .regex(/^(?:\+254|0|254)[0-9\s-]{8,12}$/, "Invalid phone format. Use 0700123456 or +254..."),
  background: z.string()
    .trim()
    .min(10, "Please share at least 10 characters")
    .max(1000, "Background must be less than 1000 characters"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type PartnerApplicationFormData = z.infer<typeof partnerApplicationSchema>;
