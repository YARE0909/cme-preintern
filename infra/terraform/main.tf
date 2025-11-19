terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 6.0.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable necessary APIs
resource "google_project_service" "gke_api" {
  service = "container.googleapis.com"
}

resource "google_project_service" "artifact_api" {
  service = "artifactregistry.googleapis.com"
}

# Create VPC and subnet
resource "google_compute_network" "vpc" {
  name                    = "gke-network"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "gke-subnet"
  ip_cidr_range = "10.0.0.0/16"
  region        = var.region
  network       = google_compute_network.vpc.id
}

# Zonal GKE cluster in us-central1-a
resource "google_container_cluster" "primary" {
  name     = "microservices-cluster"
  location = "us-central1-a"
  initial_node_count = 1

  network    = google_compute_network.vpc.id
  subnetwork = google_compute_subnetwork.subnet.id

  ip_allocation_policy {}
}

# Node pool
resource "google_container_node_pool" "primary_nodes" {
  name       = "default-pool"
  cluster    = google_container_cluster.primary.name
  location   = "us-central1-a"

  node_config {
    machine_type = "e2-medium"
    disk_size_gb = 100
    disk_type    = "pd-balanced"
    oauth_scopes = [
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
      "https://www.googleapis.com/auth/service.management.readonly",
      "https://www.googleapis.com/auth/servicecontrol",
      "https://www.googleapis.com/auth/trace.append"
    ]
  }

  initial_node_count = 1
}

output "cluster_name" {
  value = google_container_cluster.primary.name
}
