export const TEXT_STYLE = 'text-[1.8em] font-sans font-600';
export const TEXT_STYLE_SM = 'text-[1.4em] font-sans font-400';

// ── API endpoint helpers ─────────────────────────────────────────────────────
export const ENDPOINTS = {
    lessonExplain:      (lessonId) => `api/courses/lessons/${lessonId}/explain/`,
    lessonAnnotations:  (lessonId) => `api/courses/lessons/${lessonId}/annotations/`,
    annotationPin:      (pk)       => `api/courses/annotations/${pk}/pin/`,
    annotationDelete:   (pk)       => `api/courses/annotations/${pk}/`,
};