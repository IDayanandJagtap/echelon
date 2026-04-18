class SecurityClient {
	constructor() {
		this.baseUrl = "/api";

		// Default headers
		this.defaultHeaders = {
			"Content-Type": "application/json",
		};
	}

	// Generic fetch method
	async fetchRequest(method, path, body = null) {
		try {
			const config = {
				method,
				headers: {
					...this.defaultHeaders,
				},
				credentials: "include",
			};

			if (body) {
				config.body = JSON.stringify(body);
			}

			const response = await fetch(`${this.baseUrl}${path}`, config);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
			}

			// Return null for 204 No Content
			if (response.status === 204) return null;

			return await response.json();
		} catch (error) {
			console.error(`Error in ${method} ${path} request:`, error);
			throw error;
		}
	}

	// GET request
	async get(path) {
		return this.fetchRequest("GET", path);
	}

	// POST request
	async post(path, body) {
		return this.fetchRequest("POST", path, body);
	}

	// PUT request
	async put(path, body) {
		return this.fetchRequest("PUT", path, body);
	}

	// DELETE request
	async delete(path, body = null) {
		return this.fetchRequest("DELETE", path, body);
	}

	// PATCH request (optional)
	async patch(path, body) {
		return this.fetchRequest("PATCH", path, body);
	}
}

export function useRestSecurityClient() {
	return new SecurityClient();
}
