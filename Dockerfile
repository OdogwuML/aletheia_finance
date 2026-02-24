# ---- Build Stage ----
FROM golang:alpine AS builder

# Install build dependencies (apk works perfectly here now)
RUN apk add --no-cache gcc musl-dev git

# Allow Go to auto-download the required toolchain
ENV GOTOOLCHAIN=auto

WORKDIR /app

# Copy go module files first for better layer caching
COPY go.mod go.sum ./

# Download all dependencies
RUN go mod download

# Copy the entire source
COPY . .

# Build the binary
RUN CGO_ENABLED=1 GOOS=linux go build -o /api-server ./backend/cmd/api

# ---- Run Stage ----
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy only the compiled binary
COPY --from=builder /api-server .

# Railway injects PORT automatically; default to 8080 locally
ENV PORT=8080
EXPOSE 8080

CMD ["./api-server"]