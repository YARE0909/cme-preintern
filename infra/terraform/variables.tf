variable "project_id" {
  description = "Your GCP project ID"
  type        = string
}

variable "region" {
  description = "Region for the GKE cluster"
  type        = string
  default     = "us-central1"
}
