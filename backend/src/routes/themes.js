import { Router } from 'express';

const router = Router();

router.get('/current.css', (req, res) => {
	const theme = req.tenant?.theme || {
		primary: process.env.DEFAULT_THEME_PRIMARY || '#2d6cdf',
		background: process.env.DEFAULT_THEME_BACKGROUND || '#ffffff',
		text: process.env.DEFAULT_THEME_TEXT || '#111111'
	};
	const css = `:root{--color-primary:${theme.primary};--color-bg:${theme.background};--color-text:${theme.text};}`;
	res.header('Content-Type', 'text/css');
	res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
	res.send(css);
});

export default router;

