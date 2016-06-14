# home-inspector

## Purpose

This image tests a webapp to make sure there are no 404 errors.

## Usage

If your backend is running on a container called `webapp`, then:

```sh
docker run singapore/home-inspector http://webapp
```

Or using Docker Compose:

Define it like:

```yaml
  home-inspector:
    image: singapore/home-inspector
    command: http://webapp
```

Run it like:

```sh
docker-compose run home-inspector
```
