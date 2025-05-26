/**
 * This endpoint is disabled: Supabase has been removed from the project.
 * All item DB operations are now unimplemented.
 */
/**
 * @swagger
 * /api/items/{itemId}:
 *   get:
 *     summary: Get a single item's details
 *     description: Retrieves details for a specific item, ensuring it belongs to the authenticated user.
 *     tags: [Items]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the item to retrieve.
 *     responses:
 *       200:
 *         description: Detailed information about the item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Bad request (e.g., missing itemId).
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Item not found or access denied.
 *       500:
 *         description: Internal server error.
 */
export default function handler(req, res) {
  res.status(501).json({ error: 'This endpoint is not implemented. Supabase has been removed from the project.' });
}