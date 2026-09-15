/**
 * Google Drive Service & OAuth 2.0 Authentication Manager
 * Handles Google Identity Services (GIS) sign-in, Google Drive REST API v3 AppData folder sync,
 * and user-facing file/image exports to Google Drive.
 */

const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
  'email',
  'profile',
  'openid'
].join(' ');

export class GoogleDriveService {
  constructor() {
    this.clientId = localStorage.getItem('gdrive_client_id') || '';
    this.accessToken = sessionStorage.getItem('gdrive_token') || null;
    this.userProfile = JSON.parse(sessionStorage.getItem('gdrive_user') || 'null');
    this.tokenClient = null;
    this.listeners = [];
    this.isDemoMode = false;

    // Load saved user state if present
    if (this.userProfile && this.accessToken) {
      console.log('Restored Google Auth session for:', this.userProfile.email);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.getUserState());
    }
  }

  setClientId(clientId) {
    this.clientId = clientId.trim();
    if (this.clientId) {
      localStorage.setItem('gdrive_client_id', this.clientId);
    } else {
      localStorage.removeItem('gdrive_client_id');
    }
    this.tokenClient = null;
    this.notify();
  }

  getUserState() {
    return {
      isSignedIn: !!(this.accessToken || this.isDemoMode),
      user: this.userProfile || (this.isDemoMode ? {
        name: 'Google Cloud User',
        email: 'alex.developer@gmail.com',
        picture: ''
      } : null),
      isDemoMode: this.isDemoMode,
      clientId: this.clientId
    };
  }

  /**
   * Initiate Google OAuth Sign In
   */
  async signIn() {
    // If real Google Identity Services (GIS) is available and Client ID is configured
    if (window.google?.accounts?.oauth2 && this.clientId) {
      return new Promise((resolve, reject) => {
        try {
          this.tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: this.clientId,
            scope: DEFAULT_SCOPES,
            callback: async (tokenResponse) => {
              if (tokenResponse.error) {
                console.error('Google Auth Error:', tokenResponse);
                return reject(new Error(tokenResponse.error_description || tokenResponse.error));
              }
              this.accessToken = tokenResponse.access_token;
              sessionStorage.setItem('gdrive_token', this.accessToken);

              // Fetch User Info
              try {
                const profile = await this.fetchUserProfile(this.accessToken);
                this.userProfile = profile;
                sessionStorage.setItem('gdrive_user', JSON.stringify(profile));
                this.isDemoMode = false;
                this.notify();
                resolve(profile);
              } catch (e) {
                console.error('Failed to fetch user profile:', e);
                reject(e);
              }
            }
          });
          this.tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (err) {
          reject(err);
        }
      });
    }

    // Demo/Simulated Sign-In Mode if no Client ID is provided
    this.isDemoMode = true;
    this.userProfile = {
      name: 'Google Cloud User',
      email: 'alex.developer@gmail.com',
      picture: ''
    };
    sessionStorage.setItem('gdrive_user', JSON.stringify(this.userProfile));
    sessionStorage.setItem('gdrive_token', 'demo_token_123');
    this.notify();
    return this.userProfile;
  }

  /**
   * Sign Out
   */
  signOut() {
    if (this.accessToken && window.google?.accounts?.oauth2) {
      try { window.google.accounts.oauth2.revoke(this.accessToken, () => {}); } catch(e) {}
    }
    this.accessToken = null;
    this.userProfile = null;
    this.isDemoMode = false;
    sessionStorage.removeItem('gdrive_token');
    sessionStorage.removeItem('gdrive_user');
    this.notify();
  }

  async fetchUserProfile(token) {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch user info');
    return await res.json();
  }

  // =========================================================================
  // GOOGLE DRIVE APPDATA FOLDER (HIDDEN FILES FOR SYNC & RECENT FILES)
  // =========================================================================

  /**
   * Save a diagram to Google Drive AppData Folder (hidden space)
   */
  async saveDiagramToAppData(diagramData) {
    const filename = `diagram_${diagramData.diagramId || 'default'}.umlgraph`;
    const jsonStr = JSON.stringify(diagramData, null, 2);

    if (this.isDemoMode || !this.accessToken) {
      return this._saveDemoAppData(filename, diagramData);
    }

    try {
      const existingId = await this._findFileInAppData(filename);
      let fileId;

      if (existingId) {
        // Update existing file content
        const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: jsonStr
        });
        if (!res.ok) throw new Error('Failed to update diagram in AppData');
        const data = await res.json();
        fileId = data.id;
      } else {
        // Create new file in appDataFolder
        const metadata = {
          name: filename,
          parents: ['appDataFolder'],
          mimeType: 'application/json'
        };
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        const multipartRequestBody =
          delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          jsonStr +
          close_delim;

        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': `multipart/related; boundary="${boundary}"`
          },
          body: multipartRequestBody
        });
        if (!res.ok) throw new Error('Failed to save diagram to AppData');
        const data = await res.json();
        fileId = data.id;
      }

      // Update last_opened pointer & index in AppData
      await this._updateAppDataIndex(diagramData);
      return fileId;
    } catch (err) {
      console.warn('Google Drive AppData API call failed, falling back to local sync store:', err);
      return this._saveDemoAppData(filename, diagramData);
    }
  }

  /**
   * Get User's Last Opened Diagram from Google Drive AppData
   */
  async getLastOpenedDiagram() {
    if (this.isDemoMode || !this.accessToken) {
      return this._getDemoLastOpened();
    }

    try {
      const index = await this.listCloudDiagrams();
      if (!index || index.length === 0) return null;
      
      const lastOpenedMeta = index.sort((a,b) => (b.lastOpened || b.updatedAt || 0) - (a.lastOpened || a.updatedAt || 0))[0];
      if (!lastOpenedMeta) return null;

      const filename = `diagram_${lastOpenedMeta.id}.umlgraph`;
      const fileId = await this._findFileInAppData(filename);
      if (!fileId) return null;

      const contentRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      if (!contentRes.ok) return null;
      return await contentRes.json();
    } catch (err) {
      console.warn('Error fetching last opened diagram from Google Drive AppData:', err);
      return this._getDemoLastOpened();
    }
  }

  /**
   * List Cloud Diagrams in Google Drive AppData Folder
   */
  async listCloudDiagrams() {
    if (this.isDemoMode || !this.accessToken) {
      return this._getDemoCloudIndex();
    }

    try {
      const indexFileId = await this._findFileInAppData('index.json');
      if (!indexFileId) return [];

      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${indexFileId}?alt=media`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      return this._getDemoCloudIndex();
    }
  }

  /**
   * Fetch specific cloud diagram by ID
   */
  async loadCloudDiagram(diagramId) {
    const filename = `diagram_${diagramId}.umlgraph`;
    if (this.isDemoMode || !this.accessToken) {
      return this._loadDemoDiagram(filename);
    }

    try {
      const fileId = await this._findFileInAppData(filename);
      if (!fileId) throw new Error('Diagram file not found on Google Drive');

      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      if (!res.ok) throw new Error('Failed to download diagram from Google Drive');
      return await res.json();
    } catch (err) {
      return this._loadDemoDiagram(filename);
    }
  }

  // Helper to query appDataFolder files
  async _findFileInAppData(filename) {
    const q = encodeURIComponent(`name = '${filename}' and 'appDataFolder' in parents and trashed = false`);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  }

  async _updateAppDataIndex(diagramData) {
    const list = await this.listCloudDiagrams();
    const existingIdx = list.findIndex(item => item.id === diagramData.diagramId);
    const entry = {
      id: diagramData.diagramId,
      name: diagramData.diagramName || 'Untitled Diagram',
      updatedAt: Date.now(),
      lastOpened: Date.now(),
      nodeCount: diagramData.nodes ? diagramData.nodes.length : 0
    };

    if (existingIdx >= 0) list[existingIdx] = entry;
    else list.unshift(entry);

    const jsonStr = JSON.stringify(list, null, 2);
    const existingIndexId = await this._findFileInAppData('index.json');

    if (existingIndexId) {
      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingIndexId}?uploadType=media`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
        body: jsonStr
      });
    } else {
      const metadata = { name: 'index.json', parents: ['appDataFolder'], mimeType: 'application/json' };
      const boundary = '-------314159265358979323846';
      const body = `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${jsonStr}\r\n--${boundary}--`;
      await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': `multipart/related; boundary="${boundary}"` },
        body
      });
    }
  }

  // =========================================================================
  // EXPORT FILES & IMAGES TO USER'S GOOGLE DRIVE
  // =========================================================================

  /**
   * Export diagram file (.umlgraph / JSON) to Google Drive
   */
  async exportFileToDrive(filename, contentString) {
    if (this.isDemoMode || !this.accessToken) {
      return this._simulateDriveExport(filename, 'application/json');
    }

    const metadata = {
      name: filename,
      mimeType: 'application/json'
    };

    const boundary = '-------314159265358979323846';
    const body =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify(metadata) + `\r\n` +
      `--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
      contentString + `\r\n` +
      `--${boundary}--`;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`
      },
      body
    });

    if (!res.ok) throw new Error('Export to Google Drive failed');
    return await res.json();
  }

  /**
   * Export diagram PNG image to Google Drive
   */
  async exportImageToDrive(filename, dataUrl) {
    if (this.isDemoMode || !this.accessToken) {
      return this._simulateDriveExport(filename, 'image/png');
    }

    // Convert dataUrl to Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    const metadata = {
      name: filename,
      mimeType: 'image/png'
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', blob);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.accessToken}` },
      body: formData
    });

    if (!res.ok) throw new Error('Export Image to Google Drive failed');
    return await res.json();
  }

  // =========================================================================
  // SIMULATED / DEMO MODE FALLBACK ENGINE
  // =========================================================================

  _saveDemoAppData(filename, data) {
    let cloudStore = JSON.parse(localStorage.getItem('gdrive_mock_cloud') || '{}');
    cloudStore[filename] = data;
    localStorage.setItem('gdrive_mock_cloud', JSON.stringify(cloudStore));

    let index = JSON.parse(localStorage.getItem('gdrive_mock_index') || '[]');
    const existingIdx = index.findIndex(i => i.id === data.diagramId);
    const entry = {
      id: data.diagramId,
      name: data.diagramName || 'Untitled Diagram',
      updatedAt: Date.now(),
      lastOpened: Date.now(),
      nodeCount: data.nodes ? data.nodes.length : 0
    };
    if (existingIdx >= 0) index[existingIdx] = entry;
    else index.unshift(entry);
    localStorage.setItem('gdrive_mock_index', JSON.stringify(index));
    return 'demo_file_id_' + Date.now();
  }

  _getDemoCloudIndex() {
    return JSON.parse(localStorage.getItem('gdrive_mock_index') || '[]');
  }

  _getDemoLastOpened() {
    const index = this._getDemoCloudIndex();
    if (!index || index.length === 0) return null;
    const last = index.sort((a,b) => (b.lastOpened||0) - (a.lastOpened||0))[0];
    if (!last) return null;
    return this._loadDemoDiagram(`diagram_${last.id}.umlgraph`);
  }

  _loadDemoDiagram(filename) {
    const cloudStore = JSON.parse(localStorage.getItem('gdrive_mock_cloud') || '{}');
    return cloudStore[filename] || null;
  }

  _simulateDriveExport(filename, type) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id: 'sim_drive_id_' + Math.random().toString(36).slice(2, 8),
          name: filename,
          webViewLink: `https://drive.google.com/file/d/demo_${Date.now()}/view`
        });
      }, 700);
    });
  }
}

export const googleDriveService = new GoogleDriveService();
